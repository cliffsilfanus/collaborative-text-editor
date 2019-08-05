import React, { Component } from 'react';
import '../css/Auth.css';
import { Link, Redirect } from 'react-router-dom';

const BACKEND = 'http://192.168.1.45:3000';

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
			<div className="content-wrap err-wrap">
				<svg
					width="16px"
					height="16px"
					viewBox="0 0 24 24"
					fill="#d93025"
				>
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
					<path d="M0 0h24v24H0z" fill="none" />
				</svg>
				<div className="err-msg">{errMsg}</div>
			</div>
		);
	};

	render() {
		return (
			<div className="auth-wrap">
				<div className="auth">
					<div className="content-wrap">LOGO HERE</div>
					<div className="content-wrap">
						<div className="title">Sign in</div>
					</div>
					<div className="content-wrap">
						<div className="subtitle">
							to continue to Horizons Docs
						</div>
					</div>
					<div className="content-wrap">
						<input
							className={
								this.state.noUname || this.state.wrongAuth
									? 'input input-err'
									: 'input'
							}
							type="text"
							placeholder="Email"
							onChange={this.updateUname}
							value={this.state.username}
						/>
					</div>
					{this.state.noUname && this.renderErr('Enter an email')}
					<div className="content-wrap">
						<input
							className={
								this.state.noPword || this.state.wrongAuth
									? 'input input-err'
									: 'input'
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
					<div className="content-wrap footer-wrap">
						<Link to="/register" className="noLinkStyle">
							<div className="redirect">Create account</div>
						</Link>
						<button className="button" onClick={this.submit}>
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
