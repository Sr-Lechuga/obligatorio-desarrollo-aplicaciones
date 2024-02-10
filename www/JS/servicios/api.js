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

const registerData = {
  user: "jonattanlimo@gmail.com",
  password: "Contrasenia123.",
  country: 235,
  calories: 3000
}

const loginData ={
  username: "jonattanlimo@gmail.com",
  password:"Contrasenia123."
}



function RegisterUser({user,password,country,calories}){
  
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
        codigo: response.status,
        message: "Las datos de registo no son validos",
      });
    }
    else{
      return response.json();
    }
  })
  .then(data => {
    console.log(data);
    localStorage.setItem("loggedUser",JSON.stringify(data));
    return data;
  }).catch(err => {throw new Error(err)})

}


function LoginUser({username,password}){
  fetch(`${baseURL}login.php`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({usuario:username,password:password})
  }).then(res=>{
    if(!res.ok){
      return Promise.reject("credenciales incorrectas")
    }
    return res.json()
  }).then(data=>{
    localStorage.setItem("loggedUser",JSON.stringify(data))
    console.log(data);
  }).catch(err=> {throw new Error(err)})
}

function LogOut(){
  localStorage.clear();
}