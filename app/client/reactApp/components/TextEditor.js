import React, { Component } from 'react';
import {
	Editor,
	EditorState,
	RichUtils,
	Modifier,
	CharacterMetadata,
	convertToRaw,
	convertFromRaw,
	SelectionState,
	getDefaultKeyBinding,
	KeyBindingUtil
} from 'draft-js';
const { hasCommandModifier } = KeyBindingUtil;
import '../css/textEditor.css';
import { Map } from 'immutable';

const saveBinding = e => {
	if (hasCommandModifier(e) && e.keyCode === 83) {
		return 'save';
	}
	return getDefaultKeyBinding(e);
};

export default class TextEditor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			documentName: '',
			editorState: EditorState.createEmpty(),
			selectionIsBold: false,
			selectionIsItalic: false,
			selectionIsUnderline: false,
			selectionColor: '#ffffff',
			selectionFontSize: 16,
			selectionFont: 'System UI'
		};

		this.onChange = editorState => {
			props.socket.emit('changeDoc', {
				docId: props.docId,
				data: JSON.stringify(
					convertToRaw(editorState.getCurrentContent())
				),
				selectData: JSON.stringify(editorState.getSelection())
			});
		};

		this.changeDoc = ({ data, selectData }) => {
			let currState = EditorState.createWithContent(
				convertFromRaw(JSON.parse(data))
			);
			let currSelect = SelectionState.createEmpty();
			currSelect = currSelect.merge(JSON.parse(selectData));
			currState = EditorState.acceptSelection(currState, currSelect);
			const inlineStyle = currState.getCurrentInlineStyle();
			const checkStyle = inlineStyle.toJS();
			let fontSize;
			for (let i = 0; i < checkStyle.length; i++) {
				if (checkStyle[i].startsWith('size|')) {
					fontSize = checkStyle[i].slice(5);
				}
			}
			let font;
			for (let i = 0; i < checkStyle.length; i++) {
				if (checkStyle[i].startsWith('font|')) {
					font = checkStyle[i].slice(5);
				}
			}
			this.setState({
				editorState: currState,
				selectionIsBold: inlineStyle.has('BOLD'),
				selectionIsItalic: inlineStyle.has('ITALIC'),
				selectionIsUnderline: inlineStyle.has('UNDERLINE'),
				selectionFontSize: fontSize || 16,
				selectionFont: font || 'System UI'
			});
		};

		this.handleKeyCommand = command => {
			if (command === 'save') {
				const content = JSON.stringify(
					convertToRaw(this.state.editorState.getCurrentContent())
				);
				props.socket.emit('saveDoc', {
					id: this.props.docId,
					content
				});
				return 'handled';
			}
			return 'not-handled';
		};

		this.loadDoc = ({ title, content }) => {
			if (content) {
				const currState = EditorState.createWithContent(
					convertFromRaw(JSON.parse(content))
				);
				this.setState({
					editorState: currState,
					documentName: title
				});
			}
		};

		this.colorPicker = React.createRef();
		this.saveInterval = null;
	}

	componentDidMount = () => {
		this.props.socket.emit('loadDoc', this.props.docId);
		this.props.socket.on('changeDoc', this.changeDoc);
		this.props.socket.on('loadDoc', this.loadDoc);
		if (!this.saveInterval) {
			this.saveInterval = setInterval(() => {
				const content = JSON.stringify(
					convertToRaw(this.state.editorState.getCurrentContent())
				);
				this.props.socket.emit('saveDoc', {
					id: this.props.docId,
					content
				});
			}, 30 * 1000);
		}
	};

	componentWillUnmount = () => {
		this.props.removeListener('changeDoc', this.changeDoc);
		this.props.socket.emit('leaveDoc', this.props.docId);
		if (this.saveInterval) {
			clearInterval(this.saveInterval);
			this.saveInterval = null;
		}
	};

	_onInlineClick(style) {
		this.onChange(
			RichUtils.toggleInlineStyle(this.state.editorState, style)
		);
	}

	_toggleList(type) {
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				`${type}-list-item`
			)
		);
	}

	_changeAlignment(alignment) {
		// Generic pattern in modifying data
		const { editorState } = this.state;
		const currentContent = editorState.getCurrentContent();
		const currentSelection = editorState.getSelection();

		// Block data or individual?
		const nextContentState = Modifier.mergeBlockData(
			currentContent,
			currentSelection,
			Map({ alignment })
		);

		this.onChange(
			EditorState.push(
				editorState,
				nextContentState,
				'change-inline-style'
			)
		);
	}

	_changeFontSize(size) {
		this.setState({
			selectionFontSize: size
		});
		const { editorState } = this.state;
		const currentContent = editorState.getCurrentContent();
		const currentSelection = editorState.getSelection();

		const removedSizeContent = removeInlineStyle(
			currentContent,
			currentSelection,
			style => {
				return style.startsWith('size|');
			}
		);

		const nextContentState = Modifier.applyInlineStyle(
			removedSizeContent,
			currentSelection,
			`size|${size}`
		);

		this.onChange(
			EditorState.push(
				editorState,
				nextContentState,
				'change-inline-style'
			)
		);
	}

	_changeFont(font) {
		this.setState({
			selectionFont: font
		});
		const { editorState } = this.state;
		const currentContent = editorState.getCurrentContent();
		const currentSelection = editorState.getSelection();

		const removedFontContent = removeInlineStyle(
			currentContent,
			currentSelection,
			style => {
				return style.startsWith('font|');
			}
		);

		const nextContentState = Modifier.applyInlineStyle(
			removedFontContent,
			currentSelection,
			`font|${font}`
		);

		this.onChange(
			EditorState.push(
				editorState,
				nextContentState,
				'change-inline-style'
			)
		);
	}

	_toggleColor(color) {
		this.setState({ selectionColor: color });
		const { editorState } = this.state;
		const currentContent = editorState.getCurrentContent();
		const currentSelection = editorState.getSelection();

		const removedColorsContent = removeInlineStyle(
			currentContent,
			currentSelection,
			style => {
				return style.startsWith('color|');
			}
		);

		const nextContentState = Modifier.applyInlineStyle(
			removedColorsContent,
			currentSelection,
			`color|${color}`
		);

		this.onChange(
			EditorState.push(
				editorState,
				nextContentState,
				'change-inline-style'
			)
		);
	}

	myBlockStyleFn(contentBlock) {
		return contentBlock.getData().get('alignment');
	}

	render() {
		const sizeList = [
			8,
			9,
			10,
			11,
			12,
			14,
			16,
			18,
			20,
			24,
			30,
			36,
			48,
			60,
			72,
			96
		];
		const fontList = [
			'Arial',
			'Comic Sans MS',
			'Courier',
			'Georgia',
			'Helvetica',
			'Impact',
			'System UI',
			'Times New Roman',
			'Times',
			'Trebuchet MS',
			'Verdana'
		];
		return (
			<div className="main">
				<div className="navbar">
					<input
						className="documentName"
						placeholder="Untitled document"
						type="text"
						onChange={e =>
							this.setState({
								documentName: e.target.value
							})
						}
						onBlur={e => {
							this.props.socket.emit('editTitle', {
								id: this.props.docId,
								title: e.target.value
							});
						}}
						value={this.state.documentName}
					/>
					<hr />
					<ul className="toolbar">
						<li
							className="fas fa-bold"
							onClick={() => this._onInlineClick('BOLD')}
							style={
								this.state.selectionIsBold
									? {
											backgroundColor: '#e8f0fe',
											color: '#1a73e8'
									  }
									: null
							}
						/>
						<li
							className="fas fa-italic"
							onClick={() => this._onInlineClick('ITALIC')}
							style={
								this.state.selectionIsItalic
									? {
											backgroundColor: '#e8f0fe',
											color: '#1a73e8'
									  }
									: null
							}
						/>
						<li
							className="fas fa-underline"
							onClick={() => this._onInlineClick('UNDERLINE')}
							style={
								this.state.selectionIsUnderline
									? {
											backgroundColor: '#e8f0fe',
											color: '#1a73e8'
									  }
									: null
							}
						/>
						<li
							className="fas fa-paint-brush"
							onClick={() => this.colorPicker.current.click()}
						/>
						<input
							type="color"
							style={{
								display: 'none'
							}}
							value={this.state.selectionColor}
							onChange={e => this._toggleColor(e.target.value)}
							ref={this.colorPicker}
						/>
						<div className="verticalLine" />
						<li
							className="fas fa-align-left"
							onClick={() => this._changeAlignment('left')}
						/>
						<li
							className="fas fa-align-center"
							onClick={() => this._changeAlignment('center')}
						/>
						<li
							className="fas fa-align-right"
							onClick={() => this._changeAlignment('right')}
						/>
						<div className="verticalLine" />
						<li
							className="fas fa-list-ul"
							onClick={() => this._toggleList('unordered')}
						/>
						<li
							className="fas fa-list-ol"
							onClick={() => this._toggleList('ordered')}
						/>
						<div className="verticalLine" />
						<div className="fontSelect">
							<select
								onChange={e => this._changeFont(e.target.value)}
								value={this.state.selectionFont}
							>
								{fontList.map(font => (
									<option key={font} value={font}>
										{font}
									</option>
								))}
							</select>
						</div>
						<div className="verticalLine" />
						<div className="fontSelect">
							<select
								onChange={e =>
									this._changeFontSize(e.target.value)
								}
								value={this.state.selectionFontSize}
							>
								{sizeList.map(size => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
						</div>
					</ul>
					<hr />
				</div>
				<div className="content-area">
					<div className="content-page">
						<Editor
							editorState={this.state.editorState}
							textAlignment={this.state.currentTextAlignment}
							customStyleFn={(style, block) => {
								let styles = {};
								style.forEach(a => {
									const colors = a.match(/^color\|(.*)/);
									const sizes = a.match(/^size\|(.*)/);
									const fonts = a.match(/^font\|(.*)/);
									if (colors) {
										styles.color = colors[1];
									}
									if (sizes) {
										styles.fontSize = sizes[1] + 'px';
									}
									if (fonts) {
										if (fonts[1] === 'System UI') {
											styles.fontFamily = 'system-ui';
										} else {
											styles.fontFamily = fonts[1];
										}
									}
								});
								return styles;
							}}
							blockStyleFn={this.myBlockStyleFn}
							onChange={test => this.onChange(test)}
							handleKeyCommand={this.handleKeyCommand}
							keyBindingFn={saveBinding}
						/>
					</div>
				</div>
			</div>
		);
	}
}

function removeInlineStyle(contentState, selectionState, testFn) {
	const blockMap = contentState.getBlockMap();
	const startKey = selectionState.getStartKey();
	const startOffset = selectionState.getStartOffset();
	const endKey = selectionState.getEndKey();
	const endOffset = selectionState.getEndOffset();

	const newBlocks = blockMap
		.skipUntil((_, k) => k === startKey)
		.takeUntil((_, k) => k === endKey)
		.concat(Map([[endKey, blockMap.get(endKey)]]))
		.map((block, blockKey) => {
			let sliceStart;
			let sliceEnd;

			if (startKey === endKey) {
				sliceStart = startOffset;
				sliceEnd = endOffset;
			} else {
				sliceStart = blockKey === startKey ? startOffset : 0;
				sliceEnd = blockKey === endKey ? endOffset : block.getLength();
			}

			let chars = block.getCharacterList();
			let current;
			while (sliceStart < sliceEnd) {
				current = chars.get(sliceStart);
				const styles = current.getStyle();

				const nextChar = styles.reduce((curr, style) => {
					if (testFn(style)) {
						return CharacterMetadata.removeStyle(curr, style);
					}
					return curr;
				}, current);

				chars = chars.set(sliceStart, nextChar);
				sliceStart++;
			}

			return block.set('characterList', chars);
		});

	return contentState.merge({
		blockMap: blockMap.merge(newBlocks),
		selectionBefore: selectionState,
		selectionAfter: selectionState
	});
}
