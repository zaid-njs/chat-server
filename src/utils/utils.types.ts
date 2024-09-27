export type pagination = {
  page?: number;
  limit?: number;
};

export type userData = {
  _id: string;
  email: string;
  firstName: string;
  totalAgents?: number;
  totalListings?: number;
  addons?: { 'addons.$.startDate': Date; 'addon.$.endDate': Date };
  subscription?: { startDate: Date; endDate: Date };
};

export type Files = {
  name: string;
  mimeType: string;
};
