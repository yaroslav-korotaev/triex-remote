import type {
  StreamSpec,
  RemoteStreamParamsResponse,
  RemoteStreamHintsRequest,
  RemoteStreamHintsResponse,
  RemoteStreamOutputRequest,
  RemoteStreamOutputResponse,
  RemoteStreamProcessRequest,
  RemoteStreamProcessResponse,
  RemoteStream,
} from 'triex-types';

export type StreamOptions = {
  name: string;
  spec: StreamSpec;
};

export class Stream implements RemoteStream {
  public name: string;
  public spec: StreamSpec;
  
  constructor(options: StreamOptions) {
    const {
      name,
      spec,
    } = options;
    
    this.name = name;
    this.spec = spec;
  }
  
  public params(): RemoteStreamParamsResponse {
    const params = this.spec.params;
    
    if (params) {
      return {
        schema: params.is.schema,
        mandatory: params.mandatory,
      };
    } else {
      return { schema: null };
    }
  }
  
  public async hints(request: RemoteStreamHintsRequest): Promise<RemoteStreamHintsResponse> {
    const callback = this.spec.params?.hints;
    
    if (callback) {
      const hints = await callback(request.param, request.partial);
      
      return { hints };
    } else {
      return { hints: [] };
    }
  }
  
  public async output(request: RemoteStreamOutputRequest): Promise<RemoteStreamOutputResponse> {
    const callback = this.spec.params?.output;
    
    if (callback) {
      const schema = await callback(request.params);
      
      return { schema };
    } else {
      return { schema: null };
    }
  }
  
  public async process(request: RemoteStreamProcessRequest): Promise<RemoteStreamProcessResponse> {
    return await this.spec.process({
      now: new Date(request.now),
      state: request.state,
      params: request.params,
    });
  }
}
