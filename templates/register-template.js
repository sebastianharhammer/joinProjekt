function getRegisterContent(){
    return /*html*/`
        <div class="headAreaOfLogin">
        <img src="./img/logo-join-blue-big.png" alt="" />
      </div>
      <form
        class="signUpForm"
        onsubmit="postSignUpData('signed_users'); return false;"
      >
        <div class="back-arrow">
          <a href="login.html">
            <img src="./img/arrow-left.png" alt="Back to Login" />
          </a>
          <h1 class="FontOfOfLogin">Sign up</h1>
        </div>

        <hr class="horizontalLine" />
        <div class="loginNameInput">
          <input
            id="loginFirstName"
            class="inputMailPw"
            type="text"
            placeholder="First Name"
            required
            oninput="validate()"
          />
          <img src="./img/person.png" alt="" />
        </div>
        <div class="loginNameInput">
          <input
            id="loginLastName"
            class="inputMailPw"
            type="text"
            placeholder="Last Name"
            required
            oninput="validate()"
          />
          <img src="./img/person.png" alt="" />
        </div>
        <div class="loginNameInput">
          <input
            id="loginMail"
            class="inputMailPw"
            type="email"
            placeholder="Email"
            required
            oninput="validateEmail(); validate()"
          />
          <img src="./img/login-mail.png" alt="" />
        </div>       
        <div class="loginNameInput">
          <input
            id="loginPassword"
            class="inputMailPw"
            type="password"
            placeholder="Password"
            required
            oninput="validate()"
          />
          <img src="./img/login-lock.png" alt="" />
        </div>
        <div
          id="passWordBorder"
          class="signUpPasswordConfirmDiv defaultBorderInputSignUp"
        >
          <input
            onkeyup="comparePasswords()"
            id="loginPasswordConfirm"
            class="inputMailPw"
            type="password"
            placeholder="Confirm Password"
            required
            oninput="validate()"
          />
          <img class="lock" src="./img/login-lock.png" alt="" />
        </div>
        <div class="alert-password" id="alert-password"></div>
        <div id="emailAlert" class="alert-email"></div> 
        <div class="privacyPolicyCheckbox">
          <input
            id="registerCheckbox"
            type="checkbox"
            class="checkBoxSignUp"
            oninput="validate()"
          />
          <p class="fontPrivacyPolicy">
            I accept the <a class="privPolicyLink" href=""> Privacy Policy</a>
          </p>
        </div>
        <div class="loginButtons">
          <button
            disabled
            onclick="postSignUpData('signed_users')"
            type="button"
            class="button-signup"
            id="signUpButton"
          >
            Sign Up
          </button>
        </div>
      </form>
    </section>
    <div class="footerRegisterLogin">
      <a class="footerFont" href="./Privacy-Policy.html"
        ><p>Privacy Policy</p></a
      >
      <a class="footerFont" href="./legal-notice.html"><p>Legal Notice</p></a>
    </div>
    <div id="overlaySignUpSuccess" class="overlaySignUpSuccess d-none">
      <div class="signUpSuccessDiv" id="signUpSuccessDiv">
        <p class="successSignUpFont">You Signed Up successfully</p>
      </div>
    </div>
    `
}