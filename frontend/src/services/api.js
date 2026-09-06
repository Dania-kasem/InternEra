export const request = async (url, options = {}) => {
  return fetch(url, options);
};

export default request;
