const proofModel = require('../../models/proofModel');
const userProofModel = require('../../models/userProofModel');
const userActionModel = require('../../models/userActionModel');
const { uploadProof, deleteFile } = require('../../utils/uploadService');
const xpService = require('../../utils/xpService');

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

  // UPLOAD PROOF PHOTO
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

      // Check if proof already uploaded for this action log
      const existingProof = await userProofModel.getByUserActionId(
        userActionId
      );
      if (existingProof) {
        return res.status(400).json({
          message: 'Proof already uploaded for this action.'
        });
      }

      // Save image path
      const imagePath = req.file.path.replace(/\\/g, '/');

      // Save proof record with pending status
      const userProof = await userProofModel.create(
        userId,
        proof.id,
        userActionId,
        imagePath
      );

      // --- AI VALIDATION ---
      // For now we auto-validate as passed
      // Later you can integrate real AI image validation here
      const validationPassed = true;

      if (validationPassed) {
        // Update proof status to approved
        await userProofModel.updateStatus(userProof.id, 'approved');

        res.json({
          message: 'Proof uploaded and validated successfully!',
          data: {
            proof_image: imagePath,
            validation: 'passed',
            bonus_xp: proof.bonus_xp,
          }
        });

      } else {
        // Update proof status to rejected
        await userProofModel.updateStatus(userProof.id, 'rejected');

        res.json({
          message: 'Proof validation failed.',
          data: {
            proof_image: imagePath,
            validation: 'failed',
            bonus_xp: 0,
          }
        });
      }

    } catch (err) {
      console.error('Upload proof error:', err);
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
        return res.status(404).json({ message: 'No proof found.' });
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