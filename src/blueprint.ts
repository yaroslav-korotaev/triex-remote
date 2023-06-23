import type {
  BlueprintSpec,
  RemoteBlueprintExecuteRequest,
  RemoteBlueprintExecuteResponse,
  RemoteBlueprint,
} from 'triex-types';

export type BlueprintOptions = {
  name: string;
  spec: BlueprintSpec;
};

export class Blueprint implements RemoteBlueprint {
  public name: string;
  public spec: BlueprintSpec;
  
  constructor(options: BlueprintOptions) {
    const {
      name,
      spec,
    } = options;
    
    this.name = name;
    this.spec = spec;
  }
  
  public async execute(
    request: RemoteBlueprintExecuteRequest,
  ): Promise<RemoteBlueprintExecuteResponse> {
    const resource = await this.spec.execute(request.resource, request.command);
    
    return { resource };
  }
}
