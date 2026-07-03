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

    if (!res.ok) {
      throw new Error("Logowanie nie powiodło się");
    }

    const resdata = await res.json();

    if (resdata && resdata.access) {
      localStorage.setItem("access_token", resdata.access);
    }
    return resdata;
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

  async fetchRefresh(): Promise<any> {
    const res = await fetch(localUrl + "/api/refresh", {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      //credentials: 'include',
    });

    if (!res.ok) {
      throw new Error("Logowanie nie powiodło się");
    }

    const resdata = await res.json();

    if (resdata && resdata.access) {
      localStorage.setItem("access_token", resdata.access);
    }

    return resdata;
  },


}

export default net
