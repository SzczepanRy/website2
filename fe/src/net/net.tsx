import type { LoginFormI } from "../types/types";

const localUrl = "http://localhost:8080"

const net = {
  async fetchLogin(data: LoginFormI): Promise<any> {
    const res = await fetch(localUrl + "/api/login", {
      method: "post",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },

}

export default net
