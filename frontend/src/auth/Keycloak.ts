import Keycloak from "keycloak-js";

//TODO is this even used? remove otherwise
const keycloak = Keycloak("/keycloak.json");
keycloak.init({onLoad: "login-required"}).then(authenticated => {
});

// export default keycloak;
