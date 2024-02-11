let token = "";
Inicializar();

function Inicializar() {
  OcultarPantallas();
  AgregarEventos();
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token").trim().length > 0
  ) {
    document.querySelector("#ruteo").push("/ListadoRegistrosAlimenticios");
  } else {
    document.querySelector("#ruteo").push("/");
  }
}

function OcultarPantallas() {
  let pantallas = document.querySelectorAll(".ion-page");
  for (let i = 1; i < pantallas.length; i++) {
    pantallas[i].style.display = "none";
  }
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
    case "/ListadoProductos":
      ObtenerProductos();
      document.querySelector("#listadoRegistrosAlimenticios").style.display =
        "block";
      break;
    default:
      document.querySelector("#registro").style.display = "block";
      break;
  }
}

// Función para manejar la interfaz de usuario
function HandleUserGUIOnLogin(data) {
  //En caso que la respuesta de la API sea correcta, no devuelve una propiedad 'error'
  if (data.error !== undefined) {
    document.querySelector("#mensajeLogin").innerHTML = `${data.error}`;
  } else {
    document.querySelector("#mensajeLogin").innerHTML =
      "Inicio de sesión correcto";
    document.querySelector("#txtLoginEmail").value = "";
    document.querySelector("#txtLoginPassword").value = "";
  }
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
function Login() {
  try {
    const credentials = GetLoginCredentialsFromGUI();
    const response = loginUserAPI(credentials).json();
    response
      .then((data) => {
        HandleUserGUIOnLogin(data);
        localStorage.setItem("loggedUser", JSON.stringify(data));
      })
      .catch((error) => {
        document.querySelector("#mensajeLogin").innerHTML = error.message;
      });
  } catch (error) {
    document.querySelector("#mensajeLogin").innerHTML = error.message;
  }
}

function GetRegisterDataFromGUI() {
  const userName = document.querySelector("#txtRegisterEmail").value;
  const password = document.querySelector("#txtRegisterPassword").value;
  const checkPassword = document.querySelector(
    "#txtRegisterCheckPassword"
  ).value;
  const country = document.querySelector("#txtRegisterCountry").value;
  const caloriesDailyGoal = document.querySelector(
    "#txtRegisterCalories"
  ).value;
  const validPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W).{8,}$/;

  //Validaciones
  if (userName.trim().length == 0) {
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
    usuario: userName,
    password: password,
    idPais: country,
    caloriasDiarias: caloriesDailyGoal,
  });
}

function HandleGUIOnRegister(data) {
  if (data.error !== undefined)
    document.querySelector("#mensajeLogin").innerHTML = `${data.error}`;
  else {
    LimpiarCampos();
    document.querySelector("#mensajeRegistro").innerHTML = "Registro exitoso";
  }
}

async function Register() {
  const registerData = GetRegisterDataFromGUI();

  try {
    const response = await RegisterUserAPI(registerData);
    console.log(response);

    const data = await response.json();
    console.log(data);

    HandleGUIOnRegister(data);
    localStorage.setItem("loggedUser", JSON.stringify(data)); 
  } catch (error) {
    document.querySelector("#mensajeRegistro").innerHTML = error.message;
  }
}

function LimpiarCampos() {
  document.querySelector("#txtRegisterEmail").value = "";
  document.querySelector("#txtRegisterPassword").value = "";
  document.querySelector("#txtRegisterCheckPassword").value = "";
  document.querySelector("#txtRegisterCountry").value = "";
  document.querySelector("#txtRegisterCalories").value = "";
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
