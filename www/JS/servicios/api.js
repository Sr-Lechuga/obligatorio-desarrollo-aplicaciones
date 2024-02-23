/*Un usuario registrado
user: "jonattanlimo@gmail.com",
  password: "Contrasenia123.",
  country: 235,
  calories: 3000
  ->
apiKey: "986dec9ae5bac5acbdeee77c8a18d2eb"
caloriasDiarias: 3000
codigo: 200
id: 1596 
*/
const baseURLImage = "https://calcount.develotion.com/imgs/";
const baseURL = "https://calcount.develotion.com/";
const loggedUserJSON = JSON.parse(localStorage.getItem("loggedUser")) ? JSON.parse(localStorage.getItem("loggedUser")) : "";

// const registerData = {
//   user: "jonattanlimu@gmail.com",
//   password: "Contrasenia123.",
//   country: 235,
//   calories: 3000
// }

// const loginData ={
//   username: "jonattanlimo@gmail.com",
//   password:"Contrasenia123."
// }

// const registerMealData ={
//   apiKey:loggedUserJSON.apiKey,
//   id: loggedUserJSON.id,
//   idAlimento:8,
//   cantidad:450,
//   fecha:"2024-02-09"
// }

// const deleteRegisterMealData ={
//   apiKey:loggedUserJSON.apiKey,
//   id: loggedUserJSON.id,
//   registerId: 803
// }

async function RegisterUserAPI({user,password,country,calories}){
  return fetch(`${baseURL}usuarios.php`,{
    method:"POST",
    header:{
    "Content-Type": "application/json"
    },
    body:JSON.stringify({
      "usuario": user,
      "password":password,
      "idPais": country,
      "caloriasDiarias": calories
    })
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    if(data.codigo == 409){
      return Promise.reject({
        code: 409,
        message: data.mensaje
      });
    }
    else{
      return data;
    }
  }).catch( error => {
    return {
      error: error.code == undefined ? 400 : error.code,
      message: error.message
    }
  });
}
// Función para manejar la autenticación del usuario
async function loginUserAPI({ email, password }) {
  return fetch(`${baseURL}login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usuario: email, password: password })
    })
    .then( response => {
      return response.json();
    })
    .then( data => {
      if(data.codigo == 409){
        return {
          error: 409,
          message: data.mensaje
        };
      }
      else{
        return data;
      }
    })
    .catch(error => {
      return {
        error: 400,
        message: error.message
      }
    });
}

function LogOutAPI(){
  localStorage.clear();
}

async function getCountriesAPI(){
  return fetch(`${baseURL}/paises.php`)
  .then(response => {
    if(!response.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo recuperar la informacion de paises",
      })
    }
    return response.json();
  })
  .then(data=> data.paises)
  .catch(err=> {throw new Error(err)})
}

async function getCountriesPerUsersAPI({apiKey,id}){
  return fetch(`${baseURL}/usuariosPorPais.php`,{
    method:"GET",
    headers:{
    "Content-Type":"application/json",
    apikey:apiKey,
    iduser:id
  }})
  .then(response => {
    if(!response.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo recuperar la informacion de los usuarios por pais",
      })
    }
    
    return response.json();
  })
  .then(data => {
    return data.paises;
  })
  .catch(error => {
    throw new Error({
      error:error.codigo == undefined ? 400 : error.codigo,
      message: error.message 
    })
  });
}

// getMealsRegisters(loggedUserJSON);
async function getMealsRegistersAPI({apiKey,id}){
  return fetch(`${baseURL}/registros.php?idUsuario=${id}`,{
    method:"GET",
    headers:{
    "Content-Type":"application/json",
    apikey:apiKey,
    iduser:id
  }})
  .then(response => {
    if(!response.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo recuperar la informacion sobre los registros de comidas",
      })
    }
    
    return response.json();
  })
  .then(data => {
    const registrosNoOrdenados = data.registros;
    return registrosNoOrdenados.sort((a,b)=> {
      if(a.fecha>b.fecha){
        return -1;
      }
      else if(b.fecha>a.fecha){
        return 1
      }
      return 0;
    })
  })
  .catch(err=> {throw new Error({error:err.codigo==undefined?400: err.codigo, message:err.message})})
}

async function SetMealRegisterAPI({apiKey,id, idAlimento,cantidad,fecha}){
  return fetch(`${baseURL}/registros.php`,{
    method:"POST",
    headers:{
    "Content-Type":"application/json",
    apikey:apiKey,
    iduser:id
    },
    body:JSON.stringify({
      "idAlimento": idAlimento,
      "idUsuario": id,
      "cantidad": cantidad,
      "fecha": fecha
  })
})
  .then(response => {
    if(!response.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo hacer el registro de la comida",
      })
    }
    
    return response.json();
  })
  .then(data => {
    return data
  })
  .catch(error => {
    return {
      error: error.codigo != undefined ? error.codigo : 400,
      message: error.message
    }
  });
}

async function deleteMealRegisterAPI({apiKey,id,registerId}){
  return fetch(`${baseURL}/registros.php?idRegistro=${registerId}`,{
    method:"DELETE",
    headers:{
    "Content-Type":"application/json",
    apikey:apiKey,
    iduser:id
  }})
  .then(response => {
    if(!response.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo eliminar el registro",
      })
    }
    
    return response.json();
  })
  .then(data => {
    return data
  })
  .catch(err=> {throw new Error({error: err.codigo == undefined ? 400 : err.codigo, message: err.message})})
}

async function getFoodAPI({apiKey,id}){
  return fetch(`${baseURL}alimentos.php`,{
    method:"GET",
    headers:{
      "Content-Type":"application/json",
      apikey:apiKey,
      iduser:id
    }
  })
  .then(res=>{
    if(!res.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo conseguir los alimentos",
      })
    }
    return res.json()
  })
  .then(data=>{
    return data.alimentos;
  })
  .catch(err=>{
    throw new Error(err.message)
  })
}