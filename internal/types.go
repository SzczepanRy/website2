package internal

type ErrorRes struct{
	Status int `json:"status"`
	Message string `json:"message"`
}


type LoginRes struct{
	Status int `json:"status"`
	Message string `json:"message"`
	Access string `json:"accesss"`
	Refresh string `json:"refresh"`
}


type LoginReq struct{
	Login string `json:"login"`
	Password string `json:"password"`
}

type RedgisterReq struct{
	Login string `json:"login"`
	Email string `json:"email"`
	Password string `json:"password"`
}

type RedgisterRes struct{
	Status int `json:"status"`
	Message string `json:"message"`
}
