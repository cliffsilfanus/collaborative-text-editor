import React, { Component } from 'react';
import '../css/Auth.css';

class Login extends Component {
	render() {
		return (
			<div className="auth-wrap">
				<div className="auth">
					<div className="content-wrap">LOGO HERE</div>
					<div className="content-wrap">
						<div className="title">Register</div>
					</div>
					<div className="content-wrap">
						<div className="subtitle">
							to continue to Horizons Docs
						</div>
					</div>
					<div className="content-wrap">
						<input
							className="input"
							type="text"
							placeholder="Email"
						/>
					</div>
					<div className="content-wrap">
						<input
							className="input"
							type="password"
							placeholder="Password"
						/>
					</div>
					<div className="content-wrap footer-wrap">
						<div className="redirect">Sign in instead</div>
						<button className="button">Register</button>
					</div>
				</div>
			</div>
		);
	}
}

export default Login;
