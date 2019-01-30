import axios from "axios";

const setAuthToken = token => {
  if (token) {
    //Spply to every request
    axios.defaults.headers.common["Suthorization"] = token;
  } else {
    //Delete Auth header
    delete axios.defaults.headers.common["Suthorization"];
  }
};

export default setAuthToken;
