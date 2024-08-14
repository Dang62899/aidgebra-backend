const queryParser = {
  /*
   * Parse the query string to array
   * ?param=1,2,3,4' => [1,2,3,4]
   */
  parseToArray: (queryArray) => {
    try {
      return queryArray.split(",");
    } catch (error) {
      return [];
    }
  },
};

module.exports = queryParser;
