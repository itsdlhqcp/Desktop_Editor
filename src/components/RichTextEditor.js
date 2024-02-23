import React from "react";
import { Editor, EditorState, getDefaultKeyBinding, RichUtils, Modifier } from "draft-js";
import "./RichText.css";
import "../../node_modules/draft-js/dist/Draft.css"

class RichTextEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        internalEditorState: EditorState.createEmpty(), 
      };
   
    this.state = { editorState: props.editorState || EditorState.createEmpty(), };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (internalEditorState) => {
        this.setState({ internalEditorState });
      };
   
    this.onChange = (editorState) => {
        this.setState({ editorState });
        props.setEditorState(editorState); 
      };

    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
  }

  handleReturn = (e) => {
    
    const currentContent = this.state.editorState.getCurrentContent();
    const selection = this.state.editorState.getSelection();
    const blockKey = selection.getStartKey();

   
    if (blockKey === currentContent.getLastBlock().getKey()) {
      this.setState({ editorState: EditorState.createEmpty() });
      return 'handled';
    }

    return 'not-handled';
  };

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  _mapKeyToEditorCommand(e) {
    if (e.keyCode === 9 ) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4, 
      );

      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }

      return null;
    }

    const selection = this.state.editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const contentState = this.state.editorState.getCurrentContent();
    const block = contentState.getBlockForKey(startKey);
    const blockText = block.getText();

      if (e.key === ' ' && startOffset === 1 && blockText.startsWith('#')) {
        const newContentState = Modifier.replaceText(
          contentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 1,
          }),
          ' '
        );
  
        const newEditorState = EditorState.push(
          this.state.editorState,
          newContentState,
          'remove-range'
        );
  
        const finalEditorState = RichUtils.toggleBlockType(newEditorState, 'header-one');
        this.onChange(finalEditorState);
        return 'handled';
      }

      if (e.key === ' ' && startOffset === 1 && blockText.startsWith('*')) {
        const newContentState = Modifier.replaceText(
          contentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 1,
          }),
          ' '
        );
    
        const newEditorState = EditorState.push(
          this.state.editorState,
          newContentState,
          'remove-range'
        );
    
        const finalEditorState = RichUtils.toggleInlineStyle(newEditorState, 'BOLD');
        this.onChange(finalEditorState);
        return 'handled';
      }


    if (e.key === ' ' && startOffset === 2 && blockText.startsWith('**')) {
 
        const newContentState = Modifier.replaceText(
          contentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 2,
          }),
          ' '
        );
      
        const newEditorState = EditorState.push(
          this.state.editorState,
          newContentState,
          'remove-range'
        );
      
        const finalEditorState = RichUtils.toggleInlineStyle(newEditorState, 'REDLINE');
        this.onChange(finalEditorState);
        return 'handled';
      }

    if (e.key === ' ' && startOffset === 3 && blockText.startsWith('***')) {
        const newContentState = Modifier.replaceText(
          contentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 3,
          }),
          ' '
        );
      
        const newEditorState = EditorState.push(
          this.state.editorState,
          newContentState,
          'remove-range'
        );
      
        const finalEditorState = RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE');
        this.onChange(finalEditorState);
        return 'handled';
      }

    return getDefaultKeyBinding(e);
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const { editorState } = this.state;

    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root">
        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.mapKeyToEditorCommand}
            onChange={this.onChange}
            placeholder="How to write Story... #SPACE TO TOOGLE AND #SPACE TO UNTOOGLE HEADING-- SIMILARLY... 
            *SPACE for bold line! **SPACE for red line!  ***SPACE for UNDERLINE!  --->Happy Hacking"
            ref="editor"
            spellCheck={true}
            ndleReturn={this.handleReturn}

          />
        </div>
      </div>
    );
  }
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  REDLINE: {
    color: 'red',
  },
  UNDERLINE: {
    textDecoration: 'underline',
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

};

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
  { label: 'Red Line', style: 'REDLINE' },
];

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

};
export default RichTextEditor;
