let token = "";
Inicializar();

function Inicializar() {
  token = JSON.parse(localStorage.getItem("loggedUser")) ? JSON.parse(localStorage.getItem("loggedUser")).apiKey : "";
  OcultarPantallas();
  AgregarEventos();
  HandleGUIOnLoadRegister();
  if ( token !== undefined && token.trim().length > 0 ) {
    //Logged
    document.querySelector("#ruteo").push("/ListadoRegistrosAlimenticios");
    HandleGUIMenuOnLogin();
  } else {
    //Offline
    document.querySelector("#ruteo").push("/Login");
    HandleGUIMenuOnLogOut();
  }
}

function LogOut(){
  CerrarMenu();
  LogOutAPI();
  HandleGUIMenuOnLogOut();
  document.querySelector("#ruteo").push("/");
}

function OcultarPantallas() {
  let screens = document.querySelectorAll("ion-page");
  screens.forEach(screen => {
    screen.style.display = 'none';
  })
}

function AgregarEventos() {
  document
    .querySelector("#ruteo")
    .addEventListener("ionRouteWillChange", Navegar);
  document.querySelector("#btnLogin").addEventListener("click", Login);
  document.querySelector("#btnRegistro").addEventListener("click", Register);
}

function CerrarMenu() {
  document.querySelector("#menu").close();
}

function Navegar(event) {
  console.log(event);
  OcultarPantallas();
  switch (event.detail.to) {
    case "/":
      document.querySelector("#inicio").style.display = "block";
      break;
    case "/Login":
      document.querySelector("#mensajeLogin").innerHTML = "";
      document.querySelector("#login").style.display = "block";
      break;
    case "/Registro":
      document.querySelector("#registerMessage").innerHTML = "";
      document.querySelector("#registro").style.display = "block";
      break;
    case "/ListadoRegistrosAlimenticios":
      ObtenerProductos();
      document.querySelector("#listadoRegistrosAlimenticios").style.display = "block";
      break;
    default:
      document.querySelector("#incio").style.display = "block";
      break;
  }
}

function HandleGUIMenuOnLogin(){
  document.querySelector("ion-item[href='/LogOut']").style.display = "block";
  document.querySelector("ion-item[href='/Registro']").style.display = "none";
  document.querySelector("ion-item[href='/Login']").style.display = "none";
  document.querySelector("ion-item[href='/ListadoRegistrosAlimenticios']").style.display = "block";
  document.querySelector("ion-item[href='/AgregarRegistroAlimenticio']").style.display = "block";
  document.querySelector("ion-item[href='/Mapa']").style.display = "block";
}

function HandleGUIMenuOnLogOut(){
  document.querySelector("ion-item[href='/LogOut']").style.display = "none";
  document.querySelector("ion-item[href='/Registro']").style.display = "block";
  document.querySelector("ion-item[href='/Login']").style.display = "block";
  document.querySelector("ion-item[href='/ListadoRegistrosAlimenticios']").style.display = "none";
  document.querySelector("ion-item[href='/AgregarRegistroAlimenticio']").style.display = "none";
  document.querySelector("ion-item[href='/Mapa']").style.display = "none";
}

// Función para manejar la interfaz de usuario
function HandleUserGUIOnLogin() {
    document.querySelector("#mensajeLogin").innerHTML = "Inicio de sesión correcto";
    document.querySelector("#txtLoginEmail").value = "";
    document.querySelector("#txtLoginPassword").value = "";
    HandleGUIMenuOnLogin();
}

function GetLoginCredentialsFromGUI() {
  const email = document.querySelector("#txtLoginEmail").value;
  const password = document.querySelector("#txtLoginPassword").value;

  //Validaciones
  if (email.trim().length == 0) {
    throw new Error("El email es obligatorio");
  }
  if (password.trim().length == 0) {
    throw new Error("La contraseña es obligatoria");
  }

  return (validatedCredentials = {
    email: email,
    password: password,
  });
}

// Función principal de inicio de sesión
async function Login() {
  try {
    const credentials = GetLoginCredentialsFromGUI();
    //Hace la llamada a la API y devuelve un json con datos del error o de respuesta exitosa
    const responseData = await loginUserAPI(credentials);
    //En caso que la respuesta de la API sea correcta, no devuelve una propiedad 'error'
    if (responseData.error !== undefined) {
      throw new Error(`${responseData.message} (codigo de error: ${responseData.error})`);
    }
    localStorage.setItem("loggedUser", JSON.stringify(responseData));
    HandleUserGUIOnLogin();
    setTimeout(()=>{
      document.querySelector("#ruteo").push("/");
    },2000);
  } catch (error) {
      document.querySelector("#mensajeLogin").innerHTML = error.message;
  }
}

function GetRegisterDataFromGUI() {
  const email = document.querySelector("#txtRegisterEmail").value;
  const password = document.querySelector("#txtRegisterPassword").value;
  const checkPassword = document.querySelector("#txtRegisterCheckPassword").value;
  const country = document.querySelector("#selectRegisterCountry").value;
  const caloriesDailyGoal = document.querySelector("#txtRegisterCalories").value;
  const validPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W).{8,}$/;
console.log(country);
  //Validaciones
  if (email.trim().length == 0) {
    throw new Error("El email es obligatorio");
  }
  if (password.trim().length == 0) {
    throw new Error("La contraseña es obligatoria");
  }
  if (validPasswordRegex.exec(password) == null) {
    throw new Error(
      "La contraseña debe contener al menos 8 caracteres, una mayúscula, un numero y un caracter no alfanumérico"
    );
  }
  if (password !== checkPassword) {
    throw new Error("Las contraseñas no coinciden");
  }
  if (country.trim().length == 0) {
    throw new Error("El pais es obligatorio");
  }
  if (caloriesDailyGoal.trim().length == 0) {
    throw new Error("La meta de calorias es obligatoria");
  }
  if (parseInt(caloriesDailyGoal) == NaN) {
    throw new Error("La meta de calorias debe ser un numero");
  }

  return (validRegisterData = {
    user: email,
    password: password,
    country: country,
    calories: caloriesDailyGoal,
  });
}

async function HandleGUIOnLoadRegister(){
  try{
    const paises = await getCountriesAPI();
    let options = `<ion-select-option value="0">Seleccione un pais</ion-select-option>`;
    paises.forEach( pais => {
      options += ` <ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
    });
    document.querySelector("#selectRegisterCountry").innerHTML = options;
  } catch(error){
    document.querySelector("#registerMessage").innerHTML = error.message;
  }
}

function HandleGUIOnRegister() {
    CleanRegisterFields();
    document.querySelector("#registerMessage").innerHTML = "Registro exitoso";
    //Para auto log-in
    HandleGUIMenuOnLogin();
}

function CleanRegisterFields() {
  document.querySelector("#txtRegisterEmail").value = "";
  document.querySelector("#txtRegisterPassword").value = "";
  document.querySelector("#txtRegisterCheckPassword").value = "";
  document.querySelector("#txtRegisterCountry").value = "";
  document.querySelector("#txtRegisterCalories").value = "";
}

async function Register() {
  try {
    const registerData = GetRegisterDataFromGUI();
    const responseData = await RegisterUserAPI(registerData);
    if(responseData.error !== undefined){
      throw new Error(`${data.message} (codigo de error: ${data.error})`);
    }
    HandleGUIOnRegister(responseData);
    localStorage.setItem("loggedUser", JSON.stringify(responseData));
    setTimeout(()=>{
      document.querySelector("#ruteo").push("/");
    },2000);
  } catch (error) {
    document.querySelector("#registerMessage").innerHTML = error.message;
  }
}

function ObtenerProductos() {
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token").trim().length > 0
  ) {
    fetch(baseURL + "/productos", {
      headers: {
        "Content-type": "application/json",
        "x-auth": localStorage.getItem("token"),
      },
    })
      .then(function (response) {
        if (response.status == 401) {
          return Promise.reject({
            codigo: response.status,
            message:
              "Debes iniciar sesión para visualizar el listado de productos",
          });
        }
        return response.json();
      })
      .then(function (datos) {
        let datosProductosAPI = datos.data;
        let datosProductos = "";
        for (let i = 0; i < datosProductosAPI.length; i++) {
          datosProductos += `<ion-card>`;
          datosProductos += `<img alt="${datosProductosAPI[i].nombre}" 
  src="${baseURLImage}${datosProductosAPI[i].urlImagen}.jpg" />`;
          datosProductos += `<ion-card-header><ion-card-title>${datosProductosAPI[i].nombre}</ion-card-title>
    </ion-card-header><ion-card-content>
    <p>${datosProductosAPI[i].precio}</p>
    <p>${datosProductosAPI[i].estado}</p>
    <p>${datosProductosAPI[i].codigo}</p>
    <p>${datosProductosAPI[i].etiquetas}</p>
  </ion-card-content>
</ion-card>`;
        }
        document.querySelector("#listado").innerHTML = datosProductos;
      })
      .catch(function (Error) {
        document.querySelector("#listado").innerHTML = Error.message;
      });
  } else {
    document.querySelector("#listado").innerHTML =
      "Debes iniciar sesión para visualizar el listado de productos";
  }
}
