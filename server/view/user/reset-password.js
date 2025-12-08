const resetPasswordEmailTemplate = (user, resetUrl) => {
	const { name } = user
	return (
		`
			<h1>Hello ${name}; a request has been made to reset your password </h1>
			<p>Please click this link to reset your password. If you did not request a password reset, please ignore this email.</p>
			<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
		`
	)
}

module.exports = { resetPasswordEmailTemplate }