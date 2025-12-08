const registerUserEmailView = (userName, userEmail, OTP) => {
	return(
		`
			<h1> Congratulations ${userName} for registration</h1>
			<p> Congratulations ${userName} for registering with us, your email verification OTP is ${OTP} </p>
		`
	)
}

const adminRegisterEmailView = (userName, userEmail, userPassword, OTP) => {
	return(
		`
			<h1> Congratulations ${userName} an admin has registered your account</h1>
			<p> Here are the login credentials for you, make sure to change your password </p>
			<p> Email : ${userEmail} </p>
			<p> Password : ${userPassword} </p>
			<p> Your email validation OTP is ${OTP} </p>
		`
	)
}

module.exports = { registerUserEmailView, adminRegisterEmailView }