import {User}  from '../models/User.js'; 

const getClientProfile = async (req, res) => {
   // console.log(req.user);
  try {
   
    const userId = req.user._id; 

    const user = await User.findById(userId).select('-password'); 
    //console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateClientProfile = async (req, res) => {
  try {
    // Assuming the broker is authenticated and their ID is available in req.user
    const clientId = req.user._id;

    const {
      location,
      contactNumber,
    } = req.body;

    // Find broker by ID and role
    const client = await User.findOne({ _id: clientId, role: 'Client' });
    if (!client) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    client.location = location ?? client.location;
    client.contactNumber = contactNumber ?? client.contactNumber;

    // Save the updated broker
    const updatedClient = await client.save();

    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating broker profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
    getClientProfile,
    updateClientProfile,
}