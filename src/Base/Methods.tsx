export const getUserPhoto = (_userphoto: string | undefined) => {
    var userphoto;

    if (_userphoto) {
        userphoto = { uri: `data:image/jpeg;base64,${_userphoto}` };
    }
    else {
        userphoto = require("../Assets/Images/placeholder.jpeg");
    }

    return userphoto;
}