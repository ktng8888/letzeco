const proofModel = require('../../models/proofModel');
const userProofModel = require('../../models/userProofModel');
const userActionModel = require('../../models/userActionModel');
const { deleteFile } = require('../../utils/uploadService');
const { validateProofImage } = require('../../utils/aiValidationService');
const jwt = require('jsonwebtoken');

const isProofUploadPath = (imagePath) => {
  if (!imagePath) return false;
  const normalized = imagePath.replace(/\\/g, '/');
  return normalized.startsWith('uploads/proofs/') && !normalized.includes('..');
};

const proofController = {

  // GET PROOF REQUIREMENT FOR ACTION
  getProofByAction: async (req, res) => {
    const { actionId } = req.params;
    try {
      const proof = await proofModel.getByActionId(actionId);
      if (!proof) {
        return res.json({
          message: 'No proof required for this action.',
          data: null
        });
      }
      res.json({
        message: 'Proof requirement retrieved successfully.',
        data: proof
      });
    } catch (err) {
      console.error('Get proof error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // UPLOAD TEMPORARY PROOF PHOTO
  uploadProofPhoto: async (req, res) => {
    const userId = req.user.id;
    const { userActionId } = req.params;

    try {
      // Check file uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded.' });
      }

      // Check user action exists and belongs to user
      const userAction = await userActionModel.getById(userActionId);
      if (!userAction) {
        return res.status(404).json({
          message: 'Action log not found.'
        });
      }
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({
          message: 'Action is not in progress.'
        });
      }

      // Get proof requirement for this action
      const proof = await proofModel.getByActionId(userAction.action_id);
      if (!proof) {
        return res.status(400).json({
          message: 'This action has no proof requirement.'
        });
      }

      const existingProof = await userProofModel.getByUserActionId(userActionId);
      if (existingProof?.status === 'approved') {
        return res.status(400).json({
          message: 'Proof already approved for this action.'
        });
      }

      const imagePath = req.file.path.replace(/\\/g, '/');

      return res.json({
        message: 'Proof photo uploaded. Please validate it before completion to earn bonus XP.',
        data: {
          proof_image: imagePath,
          validation: 'not_validated',
          bonus_xp: 0,
        }
      });

    } catch (err) {
      console.error('Upload proof error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // VALIDATE TEMPORARY PROOF PHOTO
  validateProofPhoto: async (req, res) => {
    const userId = req.user.id;
    const { userActionId } = req.params;
    const { imagePath } = req.body;

    try {
      if (!isProofUploadPath(imagePath)) {
        return res.status(400).json({ message: 'Invalid proof image.' });
      }

      const userAction = await userActionModel.getById(userActionId);
      if (!userAction) {
        return res.status(404).json({ message: 'Action log not found.' });
      }
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({ message: 'Action is not in progress.' });
      }

      const proof = await proofModel.getByActionId(userAction.action_id);
      if (!proof) {
        return res.status(400).json({ message: 'This action has no proof requirement.' });
      }

      const existingProof = await userProofModel.getByUserActionId(userActionId);
      if (existingProof?.status === 'approved') {
        return res.status(400).json({ message: 'Proof already approved for this action.' });
      }

      let validationResult;
      try {
        validationResult = await validateProofImage(imagePath, proof.requirement);
      } catch (err) {
        console.error('AI validation error:', err);
        return res.status(502).json({ message: 'AI validation failed. Please try again.' });
      }

      const validationPassed = validationResult.passed;

      if (validationPassed) {
        const validationToken = jwt.sign(
          {
            type: 'proof_validation',
            user_id: userId,
            user_action_id: Number(userActionId),
            proof_id: proof.id,
            image: imagePath,
            status: 'approved',
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          message: 'Proof approved!',
          data: {
            proof_image: imagePath,
            validation: 'passed',
            bonus_xp: proof.bonus_xp,
            validation_token: validationToken,
            confidence: validationResult.confidence,
            detected_objects: validationResult.detected_objects || [],
          }
        });
      } else {
        return res.json({
          message: 'Proof validation failed.',
          data: {
            proof_image: imagePath,
            validation: 'failed',
            bonus_xp: 0,
            issue: validationResult.issue,
            expected: validationResult.expected,
          }
        });
      }

    } catch (err) {
      console.error('Validate proof error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // DELETE / RETAKE PROOF
  deleteProof: async (req, res) => {
    const userId = req.user.id;
    const { userActionId } = req.params;

    try {
      const userAction = await userActionModel.getById(userActionId);
      if (!userAction) {
        return res.status(404).json({ message: 'Action log not found.' });
      }
      if (userAction.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (userAction.status !== 'in_progress') {
        return res.status(400).json({ message: 'Action is not in progress.' });
      }

      const existingProof = await userProofModel.getByUserActionId(userActionId);
      if (!existingProof) {
        const { imagePath } = req.body;
        if (isProofUploadPath(imagePath)) {
          deleteFile(imagePath);
        }
        return res.json({ message: 'Proof photo removed. You can retake the photo.' });
      }

      // Delete the physical file from uploads/proofs/
      if (existingProof.image) {
        deleteFile(existingProof.image);
      }

      // Delete the proof record
      await userProofModel.deleteByUserActionId(userActionId);

      res.json({ message: 'Proof deleted. You can retake the photo.' });
    } catch (err) {
      console.error('Delete proof error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = proofController;
