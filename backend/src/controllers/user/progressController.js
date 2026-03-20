const progressModel = require('../../models/progressModel');
const userActionModel = require('../../models/userActionModel');
const userModel = require('../../models/userModel');

const progressController = {

  // GET PROGRESS & STATS
  getProgress: async (req, res) => {
    const userId = req.user.id;
    const { period } = req.query;
    // period: all_time, today, this_week, this_month
    const selectedPeriod = period || 'this_week';

    try {
      const user = await userModel.getProfile(userId);
      const impact = await progressModel.getEnvironmentalImpact(
        userId, selectedPeriod
      );
      const weeklyActivity = await progressModel.getWeeklyActivity(userId);
      const categoryBreakdown = await progressModel.getCategoryBreakdown(
        userId, selectedPeriod
      );

      res.json({
        message: 'Progress retrieved successfully.',
        data: {
          period: selectedPeriod,
          user: {
            level: user.level,
            level_xp: user.level_xp,
            total_xp: user.total_xp,
            weekly_xp: user.weekly_xp,
            streak: user.streak
          },
          environmental_impact: {
            co2_saved: parseFloat(impact.total_co2_saved),
            litre_saved: parseFloat(impact.total_litre_saved),
            kwh_saved: parseFloat(impact.total_kwh_saved),
            xp_earned: parseInt(impact.total_xp_earned),
            total_actions: parseInt(impact.total_actions)
          },
          weekly_activity: weeklyActivity,
          category_breakdown: categoryBreakdown
        }
      });

    } catch (err) {
      console.error('Get progress error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET CO2 DETAILED BREAKDOWN (popup)
  getCo2Breakdown: async (req, res) => {
    const userId = req.user.id;
    const { period } = req.query;
    const selectedPeriod = period || 'this_week';

    try {
      const impact = await progressModel.getEnvironmentalImpact(
        userId, selectedPeriod
      );
      const co2Comparison = await progressModel.getCo2Comparison(
        userId, selectedPeriod
      );

      // Eco equivalents calculations
      const co2 = parseFloat(impact.total_co2_saved);
      const ecoEquivalents = {
        young_trees: Math.round(co2 / 1.0),
        car_km_avoided: Math.round(co2 / 0.21),
        showers_worth: Math.round(
          parseFloat(impact.total_litre_saved) / 9.5
        ),
        household_energy_days: Math.round(
          parseFloat(impact.total_kwh_saved) / 10
        ),
        smartphone_charges: Math.round(
          parseFloat(impact.total_kwh_saved) * 66.7
        ),
      };

      res.json({
        message: 'CO2 breakdown retrieved successfully.',
        data: {
          co2_saved: co2,
          litre_saved: parseFloat(impact.total_litre_saved),
          kwh_saved: parseFloat(impact.total_kwh_saved),
          eco_equivalents: ecoEquivalents,
          comparison: co2Comparison
        }
      });

    } catch (err) {
      console.error('Get CO2 breakdown error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET LITRE DETAILED BREAKDOWN (popup)
  getLitreBreakdown: async (req, res) => {
    const userId = req.user.id;
    const { period } = req.query;
    const selectedPeriod = period || 'this_week';

    try {
      const impact = await progressModel.getEnvironmentalImpact(
        userId, selectedPeriod
      );
      const litreComparison = await progressModel.getLitreComparison(
        userId, selectedPeriod
      );

      const litre = parseFloat(impact.total_litre_saved);

      // Litre eco equivalents
      const ecoEquivalents = {
        showers_worth: Math.round(litre / 9.5),
        toilet_flushes: Math.round(litre / 6),
        drinking_days: Math.round(litre / 2),
        washing_machine_loads: Math.round(litre / 50),
      };

      res.json({
        message: 'Litre breakdown retrieved successfully.',
        data: {
          litre_saved: litre,
          eco_equivalents: ecoEquivalents,
          comparison: litreComparison
        }
      });

    } catch (err) {
      console.error('Get litre breakdown error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET KWH DETAILED BREAKDOWN (popup)
  getKwhBreakdown: async (req, res) => {
    const userId = req.user.id;
    const { period } = req.query;
    const selectedPeriod = period || 'this_week';

    try {
      const impact = await progressModel.getEnvironmentalImpact(
        userId, selectedPeriod
      );
      const kwhComparison = await progressModel.getKwhComparison(
        userId, selectedPeriod
      );

      const kwh = parseFloat(impact.total_kwh_saved);

      // kWh eco equivalents
      const ecoEquivalents = {
        smartphone_charges: Math.round(kwh * 66.7),
        led_bulb_hours: Math.round(kwh * 100),
        laptop_hours: Math.round(kwh * 20),
        household_energy_days: Math.round(kwh / 10),
      };

      res.json({
        message: 'kWh breakdown retrieved successfully.',
        data: {
          kwh_saved: kwh,
          eco_equivalents: ecoEquivalents,
          comparison: kwhComparison
        }
      });

    } catch (err) {
      console.error('Get kWh breakdown error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET COMPARISON
  getComparison: async (req, res) => {
    const userId = req.user.id;
    try {
      const weekComparison = await progressModel.getWeekComparison(userId);
      const monthComparison = await progressModel.getMonthComparison(userId);

      // Calculate percentage change for week
      const thisWeekActions = parseInt(
        weekComparison.this_week.action_count
      );
      const lastWeekActions = parseInt(
        weekComparison.last_week.action_count
      );
      const weekChange = lastWeekActions > 0
        ? Math.round(
            ((thisWeekActions - lastWeekActions) / lastWeekActions) * 100
          )
        : 0;

      // Calculate percentage change for month
      const thisMonthActions = parseInt(
        monthComparison.this_month.action_count
      );
      const lastMonthActions = parseInt(
        monthComparison.last_month.action_count
      );
      const monthChange = lastMonthActions > 0
        ? Math.round(
            ((thisMonthActions - lastMonthActions) / lastMonthActions) * 100
          )
        : 0;

      res.json({
        message: 'Comparison retrieved successfully.',
        data: {
          week: {
            this_week: thisWeekActions,
            last_week: lastWeekActions,
            percent_change: weekChange
          },
          month: {
            this_month: thisMonthActions,
            last_month: lastMonthActions,
            percent_change: monthChange
          }
        }
      });

    } catch (err) {
      console.error('Get comparison error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

  // GET 6 MONTH TREND
  getTrend: async (req, res) => {
    const userId = req.user.id;
    try {
      const trend = await progressModel.getSixMonthTrend(userId);

      // Calculate growth percentage
      let growthPercent = 0;
      if (trend.length >= 2) {
        const first = parseInt(trend[0].action_count);
        const last = parseInt(trend[trend.length - 1].action_count);
        growthPercent = first > 0
          ? Math.round(((last - first) / first) * 100)
          : 0;
      }

      res.json({
        message: '6 month trend retrieved successfully.',
        data: {
          trend,
          growth_percent: growthPercent
        }
      });

    } catch (err) {
      console.error('Get trend error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  },

};

module.exports = progressController;