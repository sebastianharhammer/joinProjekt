function getLoginTemplate(){
    return /*html*/`
        <div class="d-none logo animated-logo" id="logo">
            <img class="joinLogoBig" src="img/logo-join-blue-big.png" alt="Join-Logo" />
        </div>
            <section class="loginContent">
        <div class="headAreaOfLogin">
            <img src="./img/logo-join-blue-big.png" alt="">      
            <div class="signUpArea">
                <p class="interFontLogin">Not a Join user?</p>
                <a href="./register.html">
                <div class="signUpButton interFontLoginButton">Sign up</div>
                </a>
            </div>
        </div>

        <form class="loginForm">
            <h1 class="FontOfOfLogin">Log in</h1>
            <hr class="horizontalLine">
            <section class="button-remember-me">
            <div class="loginNameInput">
                <input id="loginMailUser" class="inputMailPw" type="email" placeholder="Email" required>
                <img src="./img/login-mail.png" alt="">
            </div>
            <div class="loginNameInput">
                <input id="loginPasswordUser" class="inputMailPw" type="password" placeholder="Password" required>
                <img src="./img/login-lock.png" alt="">
            </div>
            <div id="rememberMe" class="rememberMe">
                <input id="checkboxLogin" class="checkboxLogin" type="checkbox">
                <label class="rememberMeFont" for="checkboxLogin">Remember Me</label>
            </div>
            </section>
                <div class="failedLoginDiv" >
                    <p class="d-none failedLoginFont" id="failedLoginDiv">Check email and password. Please try again</p>
                </div>
                <div class="loginButtons">
                    <button onclick="loginUser(event)" class="logInButton interFontLoginButton">Log in</button>
                    <button onclick="loginGuest(event)" class="guestLogInUpButton guestLogInButtonFont">Guest Log in</button>
                </div>
        </form>
        <div class="msgBox" id="msgBox"></div>
    </section>
    <div class="footerRegisterLogin">
        <a class="footerFont" href="./Privacy-Policy.html"><p>Privacy Policy</p></a>
        <a class="footerFont" href="./legal-notice.html"><p>Legal Notice</p></a>
    </div>
    <div class="d-none logo" id="logo">
        <img class="joinLogoBig" src="img/logo-join-blue-big.png" alt="Join-Logo" />
    </div>
    `
}