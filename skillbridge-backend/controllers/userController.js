const userRepository = require('../repositories/userRepository');

async function getProfile(req, res) {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load profile.', error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { full_name, phone } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    const updatedUser = await userRepository.updateProfile(req.user.id, full_name, phone);
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Could not update profile.', error: error.message });
  }
}

module.exports = {
  getProfile,
  updateProfile
};
