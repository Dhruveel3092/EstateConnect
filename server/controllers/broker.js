import {User}  from '../models/User.js'; 

const getBrokerProfile = async (req, res) => {
   // console.log(req.user);
  try {
   
    const userId = req.user._id; 

    const user = await User.findById(userId).select('-password -refreshToken -passwordResetToken -__v'); 
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

const updateBrokerProfile = async (req, res) => {
  try {
    // Assuming the broker is authenticated and their ID is available in req.user
    const brokerId = req.user._id;

    const {
      companyName,
      licenseNumber,
      location,
      commissionPercentage,
      contactNumber,
    } = req.body;

    // Find broker by ID and role
    const broker = await User.findOne({ _id: brokerId, role: 'Broker' });
    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    // Update the fields
    broker.companyName = companyName ?? broker.companyName;
    broker.licenseNumber = licenseNumber ?? broker.licenseNumber;
    broker.location = location ?? broker.location;
    broker.commissionPercentage = commissionPercentage ?? broker.commissionPercentage;
    broker.contactNumber = contactNumber ?? broker.contactNumber;

    // Save the updated broker
    const updatedBroker = await broker.save();

    res.status(200).json(updatedBroker);
  } catch (error) {
    console.error('Error updating broker profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getAllBrokerProfile = async (req, res) => {
  try {
    const brokers = await User.find({
      role: 'Broker',
      companyName: { $ne: null },
      licenseNumber: { $ne: null },
      location: { $exists: true, $ne: null, $ne: '' },
      contactNumber: { $exists: true, $ne: null, $ne: '' },
      rating: { $ne: null },
      commissionPercentage: { $ne: null },
    }).select('-password -refreshToken -passwordResetToken -__v');

    res.status(200).json({ brokers });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export {
    getBrokerProfile,
    updateBrokerProfile,
    getAllBrokerProfile,
}