const host = "http://localhost:8080";

const APIRoutes = {
  host,
  login: `${host}/auth/login`,
  clientRegister: `${host}/auth/client-register`,
  brokerRegister: `${host}/auth/broker-register`,
  authCheck: `${host}/auth-check`,
  googleLogin: `${host}/auth/google-login`,
  forgotPassword: `${host}/auth/forgot-password`,
  resetPassword: `${host}/auth/reset-password`,
  logout: `${host}/auth/logout`,

  brokerageFirm: `${host}/broker/brokerage-firm`,
  getBrokerProfile: `${host}/broker/getprofile`,
  updateBrokerProfile: `${host}/broker/updateprofile`,

  getClientProfile: `${host}/client/getprofile`,
  updateClientProfile: `${host}/client/updateprofile`,
  getMyDeals: `${host}/client/get-my-deals`,

  getSignature: `${host}/general/getsignature`,
  uploadProfileImage: `${host}/general/upload-profile-image`,
  createListing: `${host}/general/create-listing`,
  getAllListings: `${host}/general/get-all-listings`,
  getSingleListing: `${host}/general/get-single-listing`,
  createBid: `${host}/general/create-bid`,
  getBids: `${host}/general/get-bids`,

  getAllBrokers: `${host}/broker/get-all-brokers`,
  getBrokerListings: `${host}/broker/get-broker-listings`,
  getBrokerListingDetails: `${host}/broker/get-broker-listing-details`,
  updateBrokerRemarks: `${host}/broker/update-remarks`,

};

export default APIRoutes;