import axios from "axios";

const defaultAxios = axios.create({
  baseURL: "http://localhost:3001",
  //timeout: 1000,
});

export default defaultAxios;
