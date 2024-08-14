const generateClassCode = {
  // generate 6 character alphanumeric string
  classCode: () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },
};

module.exports = generateClassCode;
