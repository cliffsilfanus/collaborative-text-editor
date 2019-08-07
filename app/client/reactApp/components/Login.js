import React, { Component } from 'react';
import '../css/auth.css';
import { Link, Redirect } from 'react-router-dom';
import BACKEND from './Backend';

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			noUname: false,
			noPword: false,
			wrongAuth: false,
			redirect: false
		};
	}

	updateUname = event => {
		this.setState({ username: event.target.value });
	};

	updatePword = event => {
		this.setState({ password: event.target.value });
	};

	submit = () => {
		if (!this.state.username || !this.state.password) {
			this.setState({
				noUname: !this.state.username,
				noPword: !this.state.password,
				wrongAuth: false
			});
			return;
		}
		fetch(BACKEND + '/login', {
			method: 'POST',
			mode: 'cors',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: this.state.username,
				password: this.state.password
			})
		})
			.then(res => res.json())
			.then(res => {
				if (res.error) {
					this.setState({
						noUname: false,
						noPword: false,
						wrongAuth: true
					});
				} else {
					this.setState({ redirect: true });
				}
			})
			.catch(err => console.log(err));
	};

	renderErr = errMsg => {
		return (
			<div className="auth-content-wrap auth-err-wrap">
				<svg
					width="16px"
					height="16px"
					viewBox="0 0 24 24"
					fill="#d93025"
				>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
					<path d="M0 0h24v24H0z" fill="none" />
				</svg>
				<div className="auth-err-msg">{errMsg}</div>
			</div>
		);
	};

	componentDidMount = () => {
		fetch(BACKEND + '/login', {
			method: 'GET',
			mode: 'cors',
			credentials: 'include'
		})
			.then(res => res.json())
			.then(res => {
				if (!res.error && res.isLogged) {
					this.setState({ redirect: true });
				}
			})
			.catch(err => console.log(err));
	};

	render() {
		return (
			<div className="auth-wrap">
				<div className="auth">
					<div className="auth-content-wrap">LOGO HERE</div>
					<div className="auth-content-wrap">
						<div className="auth-title">Sign in</div>
					</div>
					<div className="auth-content-wrap">
						<div className="auth-subtitle">
							to continue to Horizons Docs
						</div>
					</div>
					<div className="auth-content-wrap">
						<input
							className={
								this.state.noUname || this.state.wrongAuth
									? 'auth-input auth-input-err'
									: 'auth-input'
							}
							type="text"
							placeholder="Email"
							onChange={this.updateUname}
							value={this.state.username}
						/>
					</div>
					{this.state.noUname && this.renderErr('Enter an email')}
					<div className="auth-content-wrap">
						<input
							className={
								this.state.noPword || this.state.wrongAuth
									? 'auth-input auth-input-err'
									: 'auth-input'
							}
							type="password"
							placeholder="Password"
							onChange={this.updatePword}
							value={this.state.password}
						/>
					</div>
					{this.state.noPword && this.renderErr('Enter a password')}
					{this.state.wrongAuth &&
						this.renderErr("Couldn't find your account")}
					<div className="auth-content-wrap auth-footer-wrap">
						<Link to="/register" className="auth-noLinkStyle">
							<div className="auth-redirect">Create account</div>
						</Link>
						<button className="auth-button" onClick={this.submit}>
							Sign in
						</button>
					</div>
					{this.state.redirect && <Redirect to="/docs" />}
				</div>
			</div>
		);
	}
}

export default Login;
