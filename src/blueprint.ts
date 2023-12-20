import type {
  BlueprintSpec,
  RemoteBlueprintTransformRequest,
  RemoteBlueprintTransformResponse,
  RemoteBlueprintViewRequest,
  RemoteBlueprintViewResponse,
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
  
  public async transform(
    request: RemoteBlueprintTransformRequest,
  ): Promise<RemoteBlueprintTransformResponse> {
    if (this.spec.type != 'external') {
      throw new Error('not implemented');
    }
    
    return await this.spec.transform(request);
  }
  
  public async view(
    request: RemoteBlueprintViewRequest,
  ): Promise<RemoteBlueprintViewResponse> {
    if (this.spec.type != 'external') {
      throw new Error('not implemented');
    }
    
    return await this.spec.view(request);
  }
}
