import React, { Component } from 'react';
import {
	Editor,
	EditorState,
	RichUtils,
	Modifier,
	CharacterMetadata,
	convertToRaw,
	convertFromRaw
} from 'draft-js';
import '../css/textEditor.css';
import { Map } from 'immutable';
import BACKEND from './Backend';

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
			selectionFontSize: 18
		};
		this.onChange = editorState => {
			let inlineStyle = editorState.getCurrentInlineStyle();
			this.setState({
				editorState,
				selectionIsBold: inlineStyle.has('BOLD'),
				selectionIsItalic: inlineStyle.has('ITALIC'),
				selectionIsUnderline: inlineStyle.has('UNDERLINE')
			});
			console.log(
				JSON.stringify(convertToRaw(editorState.getCurrentContent()))
			);
		};
		this.colorPicker = React.createRef();
	}

	componentDidMount = () => {
		console.log(this.props.id);
		// const test = convertFromRaw(
		// 	JSON.parse(
		// 		'{"blocks":[{"key":"50bv7","text":"abc","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":3,"style":"UNDERLINE"},{"offset":0,"length":3,"style":"color|#82ff70"}],"entityRanges":[],"data":{"alignment":"left"}}],"entityMap":{}}'
		// 	)
		// );
		// console.log(test);
		// this.setState({
		// 	editorState: EditorState.createWithContent(test)
		// });
		// console.log(convertToRaw(this.state.editorState.getCurrentContent()));
	};

	_onInlineClick(style) {
		this.onChange(
			RichUtils.toggleInlineStyle(this.state.editorState, style)
		);
		// let inlineStyle = this.state.editorState.getCurrentInlineStyle();
		// this.setState({
		//   selectionIsBold: inlineStyle.has("BOLD"),
		//   selectionIsItalic: inlineStyle.has("ITALIC"),
		//   selectionIsUnderline: inlineStyle.has("UNDERLINE")
		// });
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
		this.setState({ selectionFontSize: size });
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
	}

	_toggleColor(color) {
		this.setState({ selectionColor: color });
		const { editorState } = this.state;
		const currentContent = editorState.getCurrentContent();
		const currentSelection = editorState.getSelection();

		// console.log(currentContent.toJS());

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
		return (
			<div className="main">
				<div className="navbar">
					<textarea
						className="documentName"
						placeholder="Untitled document"
						rows="1"
						onChange={e =>
							this.setState({ documentName: e.target.value })
						}
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
							style={{ display: 'none' }}
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
						<input
							type="number"
							placeholder="Font Size"
							size="20"
							value={this.state.selectionFontSize}
							onChange={e => this._changeFontSize(e.target.value)}
						/>
					</ul>
					<hr />
				</div>
				<div className="content-area">
					<div className="content-page">
						<Editor
							editorState={this.state.editorState}
							textAlignment={this.state.currentTextAlignment}
							customStyleFn={(style, block) => {
								// console.log("custom fn", style.toJS(), block.toJS());
								let styles = {};
								style.forEach(a => {
									const matches = a.match(/^color\|(.*)/);
									// console.log("matches", matches);
									if (matches) {
										styles.color = matches[1];
									}
								});
								// console.log("styles:", styles);
								return styles;
							}}
							blockStyleFn={this.myBlockStyleFn}
							onChange={this.onChange}
						/>
					</div>
				</div>
			</div>

			//   <div className="content-area">
			//       <div className="content">

			//       </div>
			//   </div>
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
