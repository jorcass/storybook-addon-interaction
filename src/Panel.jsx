import React from 'react';
import PropTypes from 'prop-types';

export default class Panel extends React.PureComponent {
  static propTypes = {
    channel: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { state: {}, logs: [] };
    // TODO: Add babel for generating actual plugin files
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    const { channel, api } = this.props;
    channel.on('addon:interaction:update', this.update);
    this.stopListeningOnStory = api.onStory(() => {
      this.setState({ state: {}, logs: [] });
      // TODO: Is this happening in two places?
      channel.emit('addon:interaction:reset');
    });
  }

  componentWillUnmount() {
    const { channel } = this.props;
    channel.removeListener('addon:interaction:update', this.update);
    this.stopListeningOnStory();
  }

  update() {
  }

  render() {
    return (
      <div>
        <h1>Test</h1>
      </div>
    );
  }
}
