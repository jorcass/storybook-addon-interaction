import React from 'react';
import PropTypes from 'prop-types';
import { Inspector } from 'react-inspector';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { STORY_CHANGED } from '@storybook/core-events';
import styled from '@emotion/styled'

const H3 = styled.h3`
  color: rgb(0, 42, 109);
`;
const Div = styled.div`
  padding-left: 5px;
`;
const Section = styled.div`
  border-top: 1px solid lightgray;
  padding-bottom: 20px;
  padding-left: 5px;
  flex: 1;
  min-width: 300px;
`;
const style = <style>
{`
  .content {
    display: flex;
    flex-wrap: wrap;
  }
  .sublog {
    padding-left: 15px;
  }
  .sublog-enter {
  }
  /* ending ENTER animation */
  .sublog-enter-active {
  }
  /* starting EXIT animation */
  .sublog-exit {
    display: none;
  }
  /* ending EXIT animation */
  .sublog-exit-active {
  }
  .log > li:first-child{
    border: solid lightgray 1px;
    -webkit-box-shadow: -3px 6px 15px -1px rgba(0,0,0,0.3); 
    box-shadow: -3px 6px 15px -1px rgba(0,0,0,0.3);
    padding: 5px 0px 5px 5px;
    margin-bottom: 20px;
    margin-right: 5px;
    margin-left: -5px;
  }
  .state-enter {
    opacity: 0.3;
    color: red;
    transition: all 500ms ease-in-out;
  }
  /* ending ENTER animation */
  .state-enter-active {
    opacity: 1;
    color: black;
  }
  /* starting EXIT animation */
  .state-exit {
    color: red;
  }
  /* ending EXIT animation */
  .state-exit-active {
    display: none;
  }
  .lastObj-enter {
    opacity: 0.5;
    transition: all 200ms ease-in;
  }
  /* ending ENTER animation */
  .lastObj-enter-active {
    opacity: 1;
  }
  /* starting EXIT animation */
  .lastObj-exit {
    transform-origin: left bottom;
  }
  /* ending EXIT animation */
  .lastObj-exit-active {
    transform:  scale(0.01, 0.01);
    max-height: 0px;
    transition: all 80ms ease-in;
  }
  `
}
</style>;

export default class Panel extends React.PureComponent {
  static propTypes = {
    channel: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: {},
      actions: [],
      logs: [],
      depth: 3,
      expandLevel: 10,
      overflowLimit: 7,
    };
  }

  emitReset = () => this.props.channel.emit('addon:interaction:reset');

  update = data => this.setState(data);

  componentDidMount() {
    const { channel, api } = this.props;
    channel.on('addon:interaction:update', this.update);
    api.on(STORY_CHANGED, this.emitReset);
  }

  componentWillUnmount() {
    const { channel, api } = this.props;
    channel.removeListener('addon:interaction:update', this.update);
    api.off(STORY_CHANGED, this.emitReset);
  }

  inspectorExpander = () => {
    const expandedLogsArr = this.state.logs.slice(this.state.depth * -1);
    return (<TransitionGroup className="log">{
          expandedLogsArr.reverse().map((log, index) => {
          if (index === 0){
            return (
                <CSSTransition
                  key={this.uuid()}
                  timeout={500}
                  classNames="state"
                >
                  <Inspector data={log} expandLevel={this.state.expandLevel} />
                </CSSTransition>
                )
              }
              else return (
              <CSSTransition classNames="sublog" timeout={0} key={this.uuid()}>
                <Inspector data={log} expandLevel={this.state.expandLevel} />
              </CSSTransition>)
        }
        )
      }
    </TransitionGroup>);
  }

  uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  inspectorGrouper = () => {
    const groupedLogsArr = this.state.logs.slice(this.state.depth * -1 - this.state.overflowLimit, this.state.depth * -1).reverse();
    return groupedLogsArr;
  }

  render() {
    if (!this.props.active) { return null; }
    const { data, logs, actions } = this.state;
    if (!Object.keys(data).length && !logs.length && !actions.length) {
      return 'No interactions';
    }
    return (
      <div className="content">
        { style }
        {Object.keys(this.state.data).length > 0 ? 
          <Section className="item">
            <H3>State</H3>
            <Div>
              <TransitionGroup>
                <CSSTransition
                  key={this.uuid()}
                  timeout={500}
                  classNames="state"
                >
                  <Inspector data={this.state.data} expandLevel={10} />
                </CSSTransition>
              </TransitionGroup>
            </Div>
          </Section>
        : null
      }
      <Section className="item">
        <H3>Logs</H3>
        <Div>
          { this.inspectorExpander() }
          { this.state.logs.length > this.state.depth?
              <div>
                <H3>. . .</H3>
                <Div>
                  <Inspector data={this.inspectorGrouper()} />
                </Div>
              </div>
            :null
          }
        </Div>
      </Section>
      <Section className="item">
        <H3>Actions</H3>
        <ul>
          {this.state.actions.map((action, index) => (<li  key={index}>{action}</li>))}
        </ul>
      </Section>
    </div>
    );
  }
}

