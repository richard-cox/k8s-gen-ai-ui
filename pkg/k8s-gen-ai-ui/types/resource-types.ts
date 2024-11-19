export const K8SGPT_RESOURCES = {
  RESULT: 'core.k8sgpt.ai.result'
}

export interface SteveResource {
  id: string,
}

export interface K8sGptResult extends SteveResource {
  spec: {
    details: string,
    error: { text: string }[]
    kind: string,
    name: string,
    parentObject: string
  }
}