import type { LoginFormI, RegisterFormI } from "../types/types";

//const localUrl = "http://localhost:8080"
const localUrl = ""

const net = {
  async fetchLogin(data: LoginFormI): Promise<any> {
    const res = await fetch(localUrl + "/api/login", {
      method: "post",
      headers: {
        "content-type": "application/json"
        //"Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },


  async fetchRegister(data: RegisterFormI): Promise<any> {
    const res = await fetch(localUrl + "/api/register", {
      method: "post",
      headers: {
        "content-type": "application/json"
        //"Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data),
      //credentials: 'include',
    });
    return res.json();
  },

}

export default net
