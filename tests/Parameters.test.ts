import * as CircleCI from '../src/index';

describe('Use basic custom parameters', () => {
  const parameterList =
    new CircleCI.parameters.CustomParametersList<CircleCI.types.parameter.literals.PipelineParameterLiteral>(
      [
        new CircleCI.parameters.CustomEnumParameter(
          'axis',
          ['x', 'y', 'z'],
          'x',
        ),
        new CircleCI.parameters.CustomParameter(
          'angle',
          CircleCI.mapping.ParameterSubtype.INTEGER,
          90,
        ),
        new CircleCI.parameters.CustomParameter(
          'should-run',
          CircleCI.mapping.ParameterSubtype.BOOLEAN,
          true,
        ),
        new CircleCI.parameters.CustomParameter(
          'message',
          CircleCI.mapping.ParameterSubtype.STRING,
          'Hello world!',
        ),
      ],
    );

  it('Should have the correct static properties for Custom Enumerable Parameter', () => {
    expect(parameterList.parameters[0].generableType).toBe(
      CircleCI.mapping.GenerableType.CUSTOM_ENUM_PARAMETER,
    );
  });

  it('Should have the correct static properties for Custom Parameter List', () => {
    expect(parameterList.generableType).toBe(
      CircleCI.mapping.GenerableType.CUSTOM_PARAMETERS_LIST,
    );
  });

  it('Should have the correct static properties for Custom Parameter ', () => {
    expect(parameterList.parameters[1].generableType).toBe(
      CircleCI.mapping.GenerableType.CUSTOM_PARAMETER,
    );
  });

  const expectedOutput = {
    axis: {
      type: 'enum',
      enum: ['x', 'y', 'z'],
      default: 'x',
    },
    angle: {
      type: 'integer',
      default: 90,
    },
    'should-run': {
      type: 'boolean',
      default: true,
    },
    message: {
      type: 'string',
      default: 'Hello world!',
    },
  };

  it('Should generate expected output', () => {
    expect(parameterList.generate()).toEqual(expectedOutput);
  });
});