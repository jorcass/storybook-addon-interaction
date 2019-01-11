# Storybook Addon Interaction

Storybook Addon Interaction can be used to provide components with an external
source of state and actions that will update that state.

Sponsored by [VizworX Inc.](https://www.vizworx.com/)

## Getting Started

Install:

```sh
npm i -D jorcass/storybook-addon-interaction
```

Then, add the following to `.storybook/addons.js`

```js
import 'storybook-addon-interaction/register';
```

Import the `withInteraction` function and use it to provide stories with state
and actions. Use the `getInteractionProps` function to provide the props to your
stories.

```js
import { storiesOf } from '@storybook/react';
import withInteraction, { getInteractionProps } from 'storybook-addon-interaction';

const Button = (props) => (
  <button
    type="button"
    onClick={props.onClick}
    style={{ background: props.background || 'grey' }}
  >
    Clicked {props.clickCount} times
  </button>
);

storiesOf('Button', module)
  .addDecorator(withInteraction({
    state: { clickCount: 0 },
    actions: {
      onClick: state => (e) => {
        e.preventDefault();
        return { clickCount: state.clickCount + 1 };
      },
    },
  }))
  .add('default view', () => <Button {...getInteractionProps()} />)
  .add(
    'with story parameters',
    () => <Button {...getInteractionProps()} />,
    {
      interaction: {
        state: { background: 'pink' },
        actions: {
          onClick: state => (e) => {
            e.preventDefault();
            return {
              clickCount: state.clickCount + 1,
              background: (state.background === 'pink' ? 'grey' : 'pink'),
            };
          },
        },
      },
    }
  );
