import { FragmentDefinitionNode, SelectionNode } from 'graphql';
import { Connection, ModelPopulateOptions, SchemaType, SchemaTypeOpts } from 'mongoose';

import { RegistryMap } from '../types/registry-map.type';
import { IPopulatableField } from '../interfaces/populatable-field.interface';

/**
 * Retrieve the Population by Selection.
 *
 * @param selections        GraphQL List of Selection Nodes
 * @param fragments         GraphQL Fragments
 * @param modelName         Model Name
 * @param connection        Mongoose Connection
 * @param registryMap       Registry Map
 * @param population        Population
 * @param rootTree          Root Tree
 * @param localTree         Local Tree
 * @returns                 List of Model Populate Options
 */
export function getPopulation(
  selections: ReadonlyArray<SelectionNode>,
  fragments: { [fragmentName: string]: FragmentDefinitionNode },
  modelName: string,
  connection: Connection,
  registryMap: RegistryMap,
  population: ModelPopulateOptions[] = [],
  rootTree: string[] = [],
  localTree: string[] = [],
): ModelPopulateOptions[] {
  return selections
    .map(selection => {
      switch (selection.kind) {
        case 'Field': {
          const value = selection.name.value;
          if (value === '__typename') return population;

          const populatableFields = registryMap.get(modelName) as IPopulatableField[];
          const localTreePath = localTree.join('.');

          if (selection.selectionSet && selection.selectionSet.selections) {
            const populatableField = populatableFields.find(
              field => field.path === (localTree.length ? `${rootTree.join('.')}.${value}` : `${value}`),
            );

            const nextPopulation = !!populatableField
              ? population.find(item => item.path === rootTree[rootTree.length - 1])
              : null;

            if (nextPopulation && !nextPopulation.populate) nextPopulation.populate = [];

            return getPopulation(
              selection.selectionSet.selections,
              fragments,
              populatableField ? populatableField.modelName : modelName,
              connection,
              registryMap,
              nextPopulation ? (nextPopulation.populate as ModelPopulateOptions[]) : population,
              [...rootTree, localTree.length ? `${localTreePath}.${value}` : value],
              populatableField ? [] : [...localTree, value],
            );
          }

          if (!rootTree.length) return population;

          const populationFromPath = population.find(
            item => item.path === rootTree[rootTree.length - localTree.length - 1],
          );

          if (populationFromPath) {
            populationFromPath.select = populationFromPath.select
              ? Array.from(
                  new Set([...populationFromPath.select, localTree.length ? `${localTreePath}.${value}` : value]),
                )
              : [value];
          } else if (!localTree.length) {
            population.push({
              path: rootTree[rootTree.length - 1],
              populate: [...getSelectedPopulationByModel(modelName, connection)],
              select: [...getSelectedFieldsByModel(modelName, connection), value],
            });
          }

          return population;
        }

        case 'InlineFragment': {
          return getPopulation(
            selection.selectionSet.selections,
            fragments,
            modelName,
            connection,
            registryMap,
            population,
            rootTree,
            localTree,
          );
        }

        case 'FragmentSpread': {
          const fragment = fragments[selection.name.value];

          return getPopulation(
            fragment.selectionSet.selections,
            fragments,
            modelName,
            connection,
            registryMap,
            population,
            rootTree,
            localTree,
          );
        }
      }
    })
    .reduce(currPopulation => currPopulation, population);
}

/**
 * Retrieve the selected population by model.
 *
 * @param modelName         Model Name
 * @param connection        Mongoose Connection
 * @returns                 List of Model Populate Options
 */
function getSelectedPopulationByModel(modelName: string, connection: Connection): ModelPopulateOptions[] {
  const population: ModelPopulateOptions[] = [];

  connection.model(modelName).schema.eachPath((path: string, type: SchemaType) => {
    const schemaTypeOpts: SchemaTypeOpts<Document> = (type as any).options;

    if (schemaTypeOpts && schemaTypeOpts.select) {
      if (schemaTypeOpts.ref) {
        population.push({
          path,
          select: [...getSelectedFieldsByModel(schemaTypeOpts.ref as string, connection)],
        });
      } else if (schemaTypeOpts.type && schemaTypeOpts.type instanceof Array) {
        const options = schemaTypeOpts.type.reduce((_, curr) => curr, null);

        if (options.ref) {
          population.push({
            path,
            select: [...getSelectedFieldsByModel(options.ref, connection)],
          });
        }
      }
    }
  });

  return population;
}

/**
 * Get selected fields by Model Name.
 *
 * @param modelName       Model Name
 * @param connection
 * @returns               List of selected fields
 */
function getSelectedFieldsByModel(modelName: string, connection: Connection): string[] {
  const fields: string[] = ['id'];

  connection.model(modelName).schema.eachPath((path: string, type: SchemaType) => {
    const schemaTypeOpts: SchemaTypeOpts<Document> = (type as any).options;

    if (schemaTypeOpts && schemaTypeOpts.select) {
      if (schemaTypeOpts.type && schemaTypeOpts.type instanceof Array) {
        const options = schemaTypeOpts.type.reduce((_, curr) => curr, null);
        if (!options.ref) fields.push(path);
      } else if (!schemaTypeOpts.ref) {
        fields.push(path);
      }
    }
  });

  return fields;
}
