import addons, { makeDecorator } from '@storybook/addons';
import Store from './Store';

const genericAction = () => () => {};
const fillGenericActions = (actions = {}) => {
  if (!Array.isArray(actions)) { return actions; }
  const newActions = {};
  actions.forEach((v) => { newActions[v] = genericAction; })
  return newActions;
};

let lastFileName = null;

export default makeDecorator({
  name: 'withInteraction',
  parameterName: 'interaction',
  allowDeprecatedUsage: false,
  skipIfNoParametersOrOptions: true,
  wrapper: (getStory, context, { options = {}, parameters = {} }) => {
    const { fileName } = context.parameters;
    Store.setChannel(addons.getChannel());
    Store.updateData({
      ...(options.state || {}),
      ...(parameters.state || {}),
      ...(lastFileName === fileName && Store.data || {}),
    });
    Store.setActions({
      ...fillGenericActions(options.actions),
      ...fillGenericActions(parameters.actions),
    });

    // This is used to ensure we reset data when switching stories.
    // The API for .onStory isn't accessible here, and storyshots sometimes
    // acts up.
    lastFileName = fileName;

    return getStory(context);
  },
});

export const getInteractionProps = () => {
  const actions = Object.entries(Store.actions)
    .reduce((acc, next) => {
      acc[next[0]] = (...args) => {
        const result = next[1](Store.data)(...args);
        const stateResult = (typeof result === 'object' && !Array.isArray(result))
          ? result
          : undefined;
        // stateResult is either the changed state or undefined
        if (stateResult) { Store.updateData(stateResult); }
        Store.addLog(next[0], args, stateResult);
      };
      return acc;
    }, {});

  return {
    ...Store.data,
    ...actions,
  };
};
