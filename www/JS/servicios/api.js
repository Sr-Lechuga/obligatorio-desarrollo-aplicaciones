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
  fetch(`${baseURL}usuarios.php`,{
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
    if(!response.ok){
      return Promise.reject({
        error: response.status,
        message: "Las datos de registo no son validos",
      });
    }
    else{
      return response;
    }
  })
  // .then(data => {
  //   console.log(data);
  //   localStorage.setItem("loggedUser",JSON.stringify(data));
  //   return data;
  // })
}
// Función para manejar la autenticación del usuario
async function loginUserAPI({ username, password }) {
  return fetch(`${baseURL}login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usuario: username, password: password })
  })
    .then(res => {
      if (!res.ok) {
        return Promise.reject("Credenciales incorrectas");
      }
      return res.json();
    })
    .catch(err => {
      throw new Error(err);
    });
}

function LogOutAPI(){
  localStorage.clear();
}

function getCountriesAPI(){
  fetch(`${baseURL}/paises.php`)
  .then(response => {
    if(!response.ok){
      return Promise.reject({
        codigo: response.status,
        message: "No se pudo recuperar la informacion de paises",
      })
    }
    
    return response.json();
  })
  .then(data => {
    console.log(data)
  })
  .catch(err=> {throw new Error(err)})
}

function getCountriesPerUsersAPI({apiKey,id}){
  fetch(`${baseURL}/usuariosPorPais.php`,{
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
    console.log(data);
    return data
  })
  .catch(err=> {throw new Error(err)})
}

// getMealsRegisters(loggedUserJSON);
function getMealsRegistersAPI({apiKey,id}){
  fetch(`${baseURL}/registros.php?idUsuario=${id}`,{
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
    console.log(data);
    return data
  })
  .catch(err=> {throw new Error(err)})
}

function setMealRegisterAPI({apiKey,id, idAlimento, cantidad,fecha}){
  fetch(`${baseURL}/registros.php`,{
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
    console.log(data);
    return data
  })
  .catch(err=> {throw new Error(err)})
}

function deleteMealRegisterAPI({apiKey,id,registerId}){
  fetch(`${baseURL}/registros.php?idRegistro=${registerId}`,{
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
    console.log(data);
    return data
  })
  .catch(err=> {throw new Error(err)})
}

function getFoodAPI({apiKey,id}){
  fetch(`${baseURL}alimentos.php`,{
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
    console.log(data)
    return data;
  })
  .catch(err=>{
    throw new Error(err.message)
  })
}