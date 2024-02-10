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
  document.querySelector("#btnRegistro").addEventListener("click", Registro);
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
function HandleUserLoginUI(data) {
  //En caso que la respuesta de la API sea correcta, no devuelve una propiedad 'error'
  if (data.error !== undefined) {
    document.querySelector("#mensajeLogin").innerHTML = `${data.error}`;
  } else {
    document.querySelector("#mensajeLogin").innerHTML = "Inicio de sesión correcto";
    document.querySelector("#txtNombreUsuario").value = "";
    document.querySelector("#txtPassword").value = "";
  }
}

// Función principal de inicio de sesión
function Login() {
  let credentials = {
    username: document.querySelector("#txtNombreUsuario").value,
    password: document.querySelector("#txtPassword").value
  };

  try {
    loginUserAPI(credentials)
      .then( data => {
        localStorage.setItem("loggedUser",data);
        HandleUserLoginUI(data);
      })
      .catch(error => {
        document.querySelector("#mensajeLogin").innerHTML = error.message;
      });
  } catch (error) {
    document.querySelector("#mensajeLogin").innerHTML = error.message;
  }
}

function Registro() {
  let email = document.querySelector("#txtEmail").value;
  let password = document.querySelector("#txtPasswordRegistro").value;
  let nombre = document.querySelector("#txtNombre").value;
  let apellido = document.querySelector("#txtApellido").value;
  let direccion = document.querySelector("#txtDireccion").value;
  try {
    if (nombre.trim().length == 0) {
      throw new Error("El nombre es obligatorio");
    }
    if (apellido.trim().length == 0) {
      throw new Error("El apellido es obligatorio");
    }
    if (direccion.trim().length == 0) {
      throw new Error("La dirección es obligatorio");
    }
    if (email.trim().length == 0) {
      throw new Error("El email es obligatorio");
    }
    if (password.trim().length == 0) {
      throw new Error("La password es obligatoria");
    }
    let datos = {
      nombre: nombre,
      apellido: apellido,
      direccion: direccion,
      email: email,
      password: password,
    };
    fetch(baseURL + "/usuarios", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(datos),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (datos) {
        if (datos.error == "") {
          document.querySelector("#mensajeRegistro").innerHTML =
            "Registro exitoso";
          LimpiarCampos();
        } else {
          document.querySelector(
            "#mensajeRegistro"
          ).innerHTML = `${datos.error}`;
        }
      })
      .catch(function (error) {
        document.querySelector(
          "#mensajeRegistro"
        ).innerHTML = `${error.message}`;
      });
  } catch (Error) {
    document.querySelector("#mensajeRegistro").innerHTML = `${Error.message}`;
  }
}
function LimpiarCampos() {
  document.querySelector("#txtEmail").value = "";
  document.querySelector("#txtPasswordRegistro").value = "";
  document.querySelector("#txtNombre").value = "";
  document.querySelector("#txtApellido").value = "";
  document.querySelector("#txtDireccion").value = "";
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
