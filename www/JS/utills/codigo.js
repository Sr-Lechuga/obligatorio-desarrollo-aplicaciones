let token = "";
let map;
let userCoords;
Inicializar();

// -------------------------------------------------------- Inicializacion
async function Inicializar() {
  navigator.geolocation.getCurrentPosition(SaveDeviceLocation, ShowError);
  token = JSON.parse(localStorage.getItem("loggedUser")) ? JSON.parse(localStorage.getItem("loggedUser")).apiKey : "";
  OcultarPantallas();
  AgregarEventos();
  if (token !== undefined && token.trim().length > 0) {
    //Logged
    document.querySelector("#ruteo").push("/ListadoRegistrosAlimenticios");
    HandleGUIMenuOnLogin();
    if (localStorage.getItem("alimentos") === undefined) {
      localStorage.setItem("alimentos", JSON.stringify(await getFoodAPI(JSON.parse(localStorage.getItem("loggedUser")))));
    }
  } else {
    //Offline
    document.querySelector("#ruteo").push("/Login");
    HandleGUIMenuOnLogOut();
  }
}

function AgregarEventos() {
  document.querySelector("#ruteo").addEventListener("ionRouteWillChange", Navegar);
  document.querySelector("#btnLogin").addEventListener("click", Login);
  document.querySelector("#btnRegistro").addEventListener("click", Register);
  document.querySelector("#btnRegisterFood").addEventListener("click", RegisterFood);
  document.querySelector("#datetime-end").addEventListener("ionChange", FilterFoodRegistersList);
  document.querySelector("#datetime-start").addEventListener("ionChange", FilterFoodRegistersList);
  document.querySelector("#btnClearFilter").addEventListener("click", HandleGUIOnLoadFoodRegisterList);
  document.querySelector("#btnUserAmountFilterMap").addEventListener("click", HandleGUIOnLoadUserAmountFilterMap);
}

function ValidateUserLogged() {
  if (localStorage.getItem("loggedUser") == null) {
    //Agregar modal que avise usuario no logueado
    document.querySelector("#ruteo").push("/Login");
  }
  if (JSON.parse(localStorage.getItem("loggedUser")).apiKey == undefined || JSON.parse(localStorage.getItem("loggedUser")).id == undefined) {
    //Agregar modal que avise usuario no logueado
    document.querySelector("#ruteo").push("/Login");
  }
}

// -------------------------------------------------------- Utils
function ShowResultMessage(id, message, duration = 2000) {
  document.querySelector(`#${id}`).duration = duration;
  document.querySelector(`#${id}`).message = message;
  document.querySelector(`#${id}`).present();
}

function OcultarPantallas() {
  let screens = document.querySelectorAll("ion-page");
  screens.forEach((screen) => {
    screen.style.display = "none";
  });
}

async function setMealsRegistered(refresh = false) {
  if (refresh || localStorage.getItem("foodRegistered") == null || JSON.parse(localStorage.getItem("foodRegistered")).length == 0) {
    const registros = await getMealsRegistersAPI(JSON.parse(localStorage.getItem("loggedUser")));

    const groupedRegisters = [];
    registros.forEach((registro) => {
      let alimento = JSON.parse(localStorage.getItem("alimentos")).find((alimento) => alimento.id == registro.idAlimento);
      registro.imageURL = `${baseURLImage}${alimento.imagen}.png`;
      registro.nombreAlimento = alimento.nombre;
      registro.unidadAlimento = alimento.porcion.charAt(alimento.porcion.length - 1);
      registro.caloriasConsumidas = (registro.cantidad * alimento.calorias) / parseInt(alimento.porcion);
      //Buscar en la lista de agrupamientos con llave la fecha del registro. Devuleve undefined si no la encuentra
      const objfinded = groupedRegisters.find((registers) => (registers[registro.fecha] ? registers[registro.fecha][0].fecha == registro.fecha : undefined));
      //Si no hay grupos para la fecha del registro, crea uno uno nuevo
      if (objfinded === undefined) {
        const obj = {};
        obj[registro.fecha] = [registro];
        groupedRegisters.push(obj);
      } else {
        //Si ya haabia un grupo para esa fecha, agrega el registo a ese grupo
        objfinded[registro.fecha].push(registro);
      }
    });
    localStorage.setItem("foodRegistered", JSON.stringify(groupedRegisters));
  }
}

async function GetUserPerCountry(responseData) {
  const usercountryamount = await getCountriesPerUsersAPI(responseData);
  let paises = await getCountriesAPI();
  let validCountries = [];
  usercountryamount.forEach((countryuseramount) => {
    let validCountry = paises.find((pais) => pais.name == countryuseramount.name);
    if (validCountry != null || validCountry != undefined) {
      countryuseramount.latitud = validCountry.latitude;
      countryuseramount.longitud = validCountry.longitude;
      validCountries.push(countryuseramount);
    }
  });
  localStorage.setItem("userPerCountry", JSON.stringify(validCountries));
}

function SaveDeviceLocation(position) {
  userCoords = [position.coords.latitude, position.coords.longitude];
}
// -------------------------------------------------------- Navigtaion

function Navegar(event) {
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
      HandleGUIOnLoadRegister();
      document.querySelector("#registerMessage").innerHTML = "";
      document.querySelector("#registro").style.display = "block";
      break;
    case "/ListadoRegistrosAlimenticios":
      HandleGUIOnLoadFoodRegisterList();
      document.querySelector("#listadoRegistrosAlimenticios").style.display = "block";
      break;
    case "/AgregarRegistroAlimenticio":
      HandleGUIOnLoadRegisterFood();
      document.querySelector("#agregarRegistroAlimenticio").style.display = "block";
      break;
    case "/Mapa":
      HandleGUIMapOnLoad();
      document.querySelector("#mapa").style.display = "block";
      break;
    default:
      document.querySelector("#inicio").style.display = "block";
      break;
  }
}

// -------------------------------------------------------- Menu
function HandleGUIMenuOnLogin() {
  document.querySelector("ion-item[href='/LogOut']").style.display = "block";
  document.querySelector("ion-item[href='/Registro']").style.display = "none";
  document.querySelector("ion-item[href='/Login']").style.display = "none";
  document.querySelector("ion-item[href='/ListadoRegistrosAlimenticios']").style.display = "block";
  document.querySelector("ion-item[href='/AgregarRegistroAlimenticio']").style.display = "block";
  document.querySelector("ion-item[href='/Mapa']").style.display = "block";
}

function HandleGUIMenuOnLogOut() {
  document.querySelector("ion-item[href='/LogOut']").style.display = "none";
  document.querySelector("ion-item[href='/Registro']").style.display = "block";
  document.querySelector("ion-item[href='/Login']").style.display = "block";
  document.querySelector("ion-item[href='/ListadoRegistrosAlimenticios']").style.display = "none";
  document.querySelector("ion-item[href='/AgregarRegistroAlimenticio']").style.display = "none";
  document.querySelector("ion-item[href='/Mapa']").style.display = "none";
}

function CerrarMenu() {
  document.querySelector("#menu").close();
}
// -------------------------------------------------------- Login
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

    //API Initialization calls (con credenciales)
    localStorage.setItem("loggedUser", JSON.stringify(responseData));
    localStorage.setItem("alimentos", JSON.stringify(await getFoodAPI(responseData)));
    //En el caso que el usuario entre por log in, se inicialice los paises (se busca reducir el llamado a la API)
    if (localStorage.getItem("paises") == null) {
      localStorage.setItem("paises", JSON.stringify(await getCountriesAPI()));
    }
    //Refresca la informacion de registros alimenticios del usuario
    await setMealsRegistered(true);
    GetUserPerCountry(responseData);

    //Manejo del DOM
    HandleGUIOnLogin();
    document.querySelector("#ruteo").push("/");
  } catch (error) {
    document.querySelector("#mensajeLogin").innerHTML = error.message;
    ShowResultMessage("loginMessageLoader", error.message);
  }
}

// Función para manejar la interfaz de usuario luego del inicio de sesion
function HandleGUIOnLogin() {
  document.querySelector("#mensajeLogin").innerHTML = "Inicio de sesión correcto";
  document.querySelector("#txtLoginEmail").value = "";
  document.querySelector("#txtLoginPassword").value = "";
  HandleGUIMenuOnLogin();
}

// -------------------------------------------------------- Register
// Función para manejar la interfaz de usuario antes del registro
async function HandleGUIOnLoadRegister() {
  try {
    const paises = await getCountriesAPI();
    localStorage.setItem("paises", JSON.stringify(paises));

    //Carga del selector de paises
    let options = `<ion-select-option value="0">Seleccione un pais</ion-select-option>`;
    paises.forEach((pais) => {
      options += ` <ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`;
    });
    document.querySelector("#selectRegisterCountry").innerHTML = options;
  } catch (error) {
    document.querySelector("#registerMessage").innerHTML = error.message;
  }
}

function GetRegisterDataFromGUI() {
  const email = document.querySelector("#txtRegisterEmail").value;
  const password = document.querySelector("#txtRegisterPassword").value;
  const checkPassword = document.querySelector("#txtRegisterCheckPassword").value;
  const country = document.querySelector("#selectRegisterCountry").value;
  const caloriesDailyGoal = document.querySelector("#txtRegisterCalories").value;
  const validPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W).{8,}$/;
  //Validaciones
  if (email.trim().length == 0) {
    throw new Error("El email es obligatorio");
  }
  if (password.trim().length == 0) {
    throw new Error("La contraseña es obligatoria");
  }
  if (validPasswordRegex.exec(password) == null) {
    throw new Error("La contraseña debe contener al menos 8 caracteres, una mayúscula, un numero y un caracter no alfanumérico");
  }
  if (password !== checkPassword) {
    throw new Error("Las contraseñas no coinciden");
  }
  if (country.trim().length == 0) {
    throw new Error("El pais es obligatorio");
  }
  if (country == 0) {
    throw new Error("El pais seleccionado no es valido");
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

async function Register() {
  document.querySelector("#registerMessage").innerHTML = "";
  try {
    const registerData = GetRegisterDataFromGUI();
    const responseData = await RegisterUserAPI(registerData);

    if (responseData.error !== undefined) {
      throw new Error(`${responseData.message} (codigo de error: ${responseData.error})`);
    }

    //Seteo de informacion global
    localStorage.setItem("loggedUser", JSON.stringify(responseData));
    localStorage.setItem("alimentos", JSON.stringify(await getFoodAPI(responseData)));

    //Manejo del DOM
    HandleGUIOnRegister(responseData);

    //Redirecccion (Para auto-login)
    setTimeout(() => {
      document.querySelector("#ruteo").push("/");
    }, 2000);
  } catch (error) {
    document.querySelector("#registerMessage").innerHTML = error.message;
    ShowResultMessage("registerLoader", `${error.message} (codigo de error: ${error.error != undefined ? error.error : "form-input"})`);
  }
}

// Función para manejar la interfaz de usuario luego del registro
function HandleGUIOnRegister() {
  CleanRegisterFields();
  ShowResultMessage("registerLoader", "¡Registo exitoso!");
  HandleGUIMenuOnLogin();
}

function CleanRegisterFields() {
  document.querySelector("#txtRegisterEmail").value = "";
  document.querySelector("#txtRegisterPassword").value = "";
  document.querySelector("#txtRegisterCheckPassword").value = "";
  document.querySelector("#selectRegisterCountry").value = 0;
  document.querySelector("#txtRegisterCalories").value = "";
}

// -------------------------------------------------------- Register food
function HandleGUIOnLoadRegisterFood() {
  try {
    const alimentos = JSON.parse(localStorage.getItem("alimentos"));

    let options = `<ion-select-option value="0">Seleccione un alimento</ion-select-option>`;
    alimentos.forEach((alimento) => {
      options += ` <ion-select-option value="${alimento.id}">${alimento.nombre} (${alimento.porcion.charAt(alimento.porcion.length - 1)})</ion-select-option>`;
    });

    //Fija la fecha de hoy como default y maxima
    let maxDate = new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString();
    document.querySelector("#dateRegisterFood").max = maxDate;
    document.querySelector("#dateRegisterFood").value = maxDate;

    document.querySelector("#selectFood").innerHTML = options;
  } catch (error) {
    document.querySelector("#foodRegisterMsg").message = error.message;
    document.querySelector("#foodRegisterMsg").present();
  }
}

function GetFoodDataFromGUI() {
  //Toma de info
  const alimentos = JSON.parse(localStorage.getItem("alimentos"));
  const { apiKey, id } = JSON.parse(localStorage.getItem("loggedUser"));
  const idAlimento = document.querySelector("#selectFood").value;
  const foodAmount = document.querySelector("#txtFoodAmount").value;
  const dateRegisterFood = document.querySelector("#dateRegisterFood").value;
  const findedFood = alimentos.find((alimento) => alimento.id == idAlimento);

  //Validacion
  if (findedFood === undefined) {
    throw new Error("Seleccione un alimento valido");
  }
  if (parseInt(foodAmount) <= 0) {
    throw new Error("La cantidad debe ser mayor a 0");
  }
  if (foodAmount.charAt(foodAmount.length - 1) !== findedFood.porcion.charAt(findedFood.porcion.length - 1)) {
    throw new Error("Las unidades debe ser igual");
  }
  // Se necesita concatenar la hora para que no devuelva la fecha del dia anterior
  if (new Date(dateRegisterFood.concat("T00:00:00")) > new Date(new Date().getTime() - 3 * 60 * 60 * 1000)) {
    throw new Error("Seleccione una fecha valida");
  }
  //Retorno condicional con credenciales
  return {
    apiKey: apiKey,
    idAlimento: idAlimento,
    id: id,
    cantidad: foodAmount,
    fecha: dateRegisterFood,
  };
}

async function RegisterFood() {
  try {
    const foodRegisterData = GetFoodDataFromGUI();
    const responseData = await SetMealRegisterAPI(foodRegisterData);

    if (responseData.error !== undefined) {
      throw new Error(`${responseData.message} (codigo de error: ${responseData.error})`);
    }

    //Es necesario pasar el parametro para poder visualizar el mensaje de exito
    HandleGUIOnRegisterFood(responseData);
  } catch (error) {
    ShowResultMessage("foodRegisterMsg", error.message);
  }
}

async function HandleGUIOnRegisterFood(responseData) {
  ShowResultMessage("foodRegisterMsg", responseData.mensaje);

  document.querySelector("#selectFood").value = "0";
  document.querySelector("#txtFoodAmount").value = "";

  //Luego del registro de un alimento es necesario refrescar los registros locales globales
  await setMealsRegistered(true);
}

// -------------------------------------------------------- List Registered food

function getTodayCalories() {
  let registrosagrupados = JSON.parse(localStorage.getItem("foodRegistered"));
  let calorias = 0;
  registrosagrupados.forEach((registroagrupado) => {
    const llaveobj = Object.keys(registroagrupado)[0];
    if (registroagrupado[llaveobj][0].fecha == new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split("T")[0]) {
      registroagrupado[llaveobj].forEach((registro) => (calorias += registro.caloriasConsumidas));
      return calorias;
    }
  });
  return calorias;
}

function getHistoryCalories() {
  let registrosagrupados = JSON.parse(localStorage.getItem("foodRegistered"));
  let calorias = 0;
  registrosagrupados.forEach((registroagrupado) => {
    const llaveobj = Object.keys(registroagrupado)[0];

    registroagrupado[llaveobj].forEach((registro) => {
      calorias += registro.caloriasConsumidas;
    });
  });
  return calorias;
}

async function HandleGUIOnLoadFoodRegisterList() {
  ValidateUserLogged();
  // console.log(getTodayCalories());
  // console.log(historyCalories());
  let date = new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString();
  document.querySelector("#datetime-end").value = date;
  document.querySelector("#datetime-end").max = date;
  document.querySelector("#datetime-start").value = date;
  document.querySelector("#datetime-start").max = date;
  try {
    //Refrsca los registros de laimentos antes de renderizarlos
    setMealsRegistered(true);

    //Devulve los registros para un usuario ordenados por fecha descendientemente
    const registros = JSON.parse(localStorage.getItem("foodRegistered"));
    CreateGroupingCards(registros);

    let todayCalories = getTodayCalories();
    let historyCalories = getHistoryCalories();

    let textColor = "green-text";
    let userData = JSON.parse(localStorage.getItem("loggedUser"));
    if (todayCalories > userData.caloriasDiarias) {
      textColor = "red-text";
    } else if (todayCalories <= userData.caloriasDiarias && todayCalories >= userData.caloriasDiarias * 0.9) {
      textColor = "orange-text";
    }

    CreateMetricsItems(textColor, todayCalories, historyCalories);
  } catch (error) {
    ShowResultMessage("foodRegisterMsg", "No se pudieron cargar los registros");
    console.log(error);
  }
}

function CreateGroupingCards(registros) {
  let elementos = ``;
  registros.forEach((groupRegister) => {
    const llavesobj = Object.keys(groupRegister);
    elementos += `<ion-card color="light">
    <ion-card-header>
      <ion-card-title>Alimentos</ion-card-title>
      <ion-card-subtitle>${llavesobj[0]}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-list>`;
    groupRegister[llavesobj[0]].forEach((registro) => {
      let templatecard = CreateRegisterFoodItem(registro);
      elementos += templatecard;
    });
    elementos += `</ion-list>
      </ion-card-content>
    </ion-card>`;
  });
  //Mostrar elementos
  document.querySelector("#showList").innerHTML = elementos;
}

function CreateRegisterFoodItem({ nombreAlimento, unidadAlimento, imageURL, cantidad, id, caloriasConsumidas }) {
  return `
      <ion-item id="food-${id}">
        <ion-thumbnail slot="start">
          <img alt="food-${nombreAlimento}" src="${imageURL}" />
        </ion-thumbnail>
        <ion-label>
          <h2>${nombreAlimento} (${unidadAlimento})</h2>
          <p>${cantidad}${unidadAlimento}</p>
          <p>Calorias consumidas: ${caloriasConsumidas} cal</p>
        </ion-label>
        <ion-button slot="end" color="danger" onClick="DeleteRegister(${id})" > Delete </ion-button>
      </ion-item>
    `;
}

function CreateMetricsItems(textColor, todayCalories, historyCalories) {
  let Metrics = `
      <ion-col class="center-text">
        <p>Hoy</p>
        <p class="enphasis-text-colored ${textColor}">${todayCalories.toFixed(2)}</p>
      </ion-col>
      <ion-col class="center-text">
        <p>Todo el tiempo</p>
        <p class="enphasis-text">${historyCalories.toFixed(2)}</p>
      </ion-col>`;
  document.querySelector("#Metrics").innerHTML = Metrics;
}

async function DeleteRegister(idRegisterFood) {
  ValidateUserLogged();

  let requestObject = JSON.parse(localStorage.getItem("loggedUser"));
  //Add to reques
  requestObject.mealRegisterId = idRegisterFood;

  try {
    HideFoodRegisterOnClick(idRegisterFood);
    const response = await deleteMealRegisterAPI(requestObject);

    if (response.codigo == 200) {
      ShowResultMessage("foodRegisterMsg", "¡Se elimino el registro con exito!");
      await setMealsRegistered(true);
      await HandleGUIOnLoadFoodRegisterList();
    }
  } catch (error) {
    ShowResultMessage("foodRegisterMsg", "No se pudo eliminar el registo");
    document.querySelector(`#food-${idRegisterFood}`).style.display = "block";
    console.log(error);
  }
}
function HideFoodRegisterOnClick(idRegisterFood) {
  ShowResultMessage("foodRegisterMsg", "Eliminando...");
  document.querySelector(`#food-${idRegisterFood}`).style.display = "none";
}
function FilterFoodRegistersList() {
  try {
    let dateStart = document.querySelector("#datetime-start").value.split("T")[0];
    let dateEnd = document.querySelector("#datetime-end").value.split("T")[0];
    let registrosLocalStorage = JSON.parse(localStorage.getItem("foodRegistered"));
    const registros = registrosLocalStorage.filter((registro) => {
      if (dateStart <= registro.fecha && registro.fecha <= dateEnd) return registro;
    });
    let elementos = ``;
    registros.forEach((groupRegister) => {
      const llavesobj = Object.keys(groupRegister);
      elementos += `<ion-card color="light">
        <ion-card-header>
          <ion-card-title>Alimentos</ion-card-title>
          <ion-card-subtitle>${llavesobj[0]}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list>`;
      groupRegister[llavesobj[0]].forEach((registro) => {
        let templatecard = CreateRegisterFoodItem(registro);
        elementos += templatecard;
      });
      elementos += `</ion-list>
          </ion-card-content>
        </ion-card>`;
    });
    //Mostrar elementos
    document.querySelector("#showList").innerHTML = elementos;
  } catch (error) {
    ShowResultMessage("foodRegisterMsg", "No se pudieron cargar los registros");
    console.log(error);
  }
}

function ShowError(error) {
  console.log(error.message);
  //Set ORT coord by default
  userCoords = [-34.90328160612759, -56.19087993236588];
}

// -------------------------------------------------------- Map

async function HandleGUIMapOnLoad() {
  let markers = getMapMarkers();
  await loadMap(markers);
}

function getMapMarkers() {
  const usersPerCountries = JSON.parse(localStorage.getItem("userPerCountry"));
  const availableCountries = JSON.parse(localStorage.getItem("paises"));
  let markers = [];

  usersPerCountries.forEach((country) => {
    const countryFinded = availableCountries.find((pais) => pais.id === country.id);
    const marker = {
      message: `La cantidad de usuarios de ${country.name} es: ${country.cantidadDeUsuarios}`,
      coords: [countryFinded.latitude, countryFinded.longitude],
      userAmount: country.cantidadDeUsuarios,
    };
    markers.push(marker);
  });
  return markers;
}

async function loadMap(markers) {
  if (map != null) {
    map.remove();
  }

  // navigator.geolocation.getCurrentPosition(SaveDeviceLocation, ShowError);
  setTimeout(() => {
    map = L.map("map");

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markers.forEach((marker) => {
      L.marker(marker.coords).addTo(map).bindPopup(marker.message).openPopup();
    });
    L.marker(userCoords).addTo(map).bindPopup("Tú estas aquí").openPopup();
    map.setView(userCoords, 13);
  }, 1000);
}

async function HandleGUIOnLoadUserAmountFilterMap() {
  let userFilter = parseInt(document.querySelector("#txtUserAmountFilterMap").value);
  if (isNaN(userFilter)) {
    userFilter = 0;
  }
  let oldmarkers = getMapMarkers();
  let markers = oldmarkers.filter((marker) => marker.userAmount >= userFilter);
  await loadMap(markers);
}

// -------------------------------------------------------- Log out
function LogOut() {
  CerrarMenu();
  LogOutAPI();
  HandleGUIMenuOnLogOut();
  document.querySelector("#ruteo").push("/Login");
}
