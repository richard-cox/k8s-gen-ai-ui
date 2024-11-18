# Hack Week Notes

Project - https://hackweek.opensuse.org/24/projects/rancher-genai-ui-extension

Inspiration - https://www.suse.com/c/rancher_blog/debugging-your-rancher-kubernetes-cluster-the-genai-way-with-k8sgpt-ollama-rancher-desktop/


## Day 1

### Notes

- K8SGTP
  - Tool to scan cluster, diagnose and triage issues in simple english
  - https://github.com/k8sgpt-ai/k8sgpt
  - https://github.com/k8sgpt-ai/k8sgpt-operator
  - https://artifacthub.io/packages/helm/k8sgpt/k8sgpt-operator
- Ollama
  - https://ollama.com/
  - https://github.com/ollama/ollama
  - https://artifacthub.io/packages/helm/ollama-helm/ollama
  - LLM, mistral

### Run locally (host machine + cli)

1. Install K8SGPT cli - https://docs.k8sgpt.ai/getting-started/installation/
   - `curl -LO https://github.com/k8sgpt-ai/k8sgpt/releases/download/v0.3.24/k8sgpt_amd64.rpm`
   - `sudo rpm -ivh -i k8sgpt_amd64.rpm`
2. Install Ollama - https://ollama.com/download
   - `curl -fsSL https://ollama.com/install.sh | sh`
3. Launch Ollama
   - (done as part of install, but if running separately) `ollama serve`
4. Pull LLM
   - `ollama pull mistral`
5. Tell K8SGPT to use ollama backend
   - `k8sgpt auth add --backend localai --model mistral --baseurl http://localhost:11434/v1`
6. GOGOGO
   - `k8sgpt analyze --explain --backend localai --with-doc --kubeconfig ~/dev/hackweek/rc-rke2.yaml`

### Run all in cluster (kube cluster + operator)

1. Install K8SGPT operator
   - https://docs.k8sgpt.ai/getting-started/in-cluster-operator/
   - Add repo - https://charts.k8sgpt.ai/
   - Install chart - k8sgpt-operator (in ns k8sgpt-operator-system) (0.2.0)
2. Install Ollama
   - https://artifacthub.io/packages/helm/ollama-helm/ollama
   - Add repo - https://otwld.github.io/ollama-helm/
   - Install chart - ollama (in ns ollama) (o.4.1)
      - Make sure to update values.yaml ollama.models: [] to be ["mistral"]
3. Make note of Ollama service endpoint
   - ollama service in ollama ns
   - endpoint is target
4. Tell K8SGPT to use ollama backend
   - ```
      apiVersion: core.k8sgpt.ai/v1alpha1
      kind: K8sGPT
      metadata:
        name: k8sgpt-ollama
      spec:
        ai:
          enabled: true
          model: mistral
          backend: localai
          baseUrl: http://10.43.118.68:11434/v1 # replace with ollama service endpoint
        noCache: false
        filters: ["Pod"]
        repository: ghcr.io/k8sgpt-ai/k8sgpt
        version: v0.3.41
     ```
### Results

If there are dodgy pods then there should be `core.k8sgpt.ai.result` / `Results` CR's created


### Troubleshooting

- There's no `detail` in a `core.k8sgpt.ai.result`
  - k8sgpt operator is probably silently failing to connect to ollama
  - nuke the `k8sgpt-operator-system/k8sgpt-operator-controller-manager-<sdf>` POD and check the start of it's container named `manager` 
  - the state of the connection between the operator and ollama should be announced there 

### UI Extension

Pretty straight forward

- Added better labelling for k8sgpt resource types
- Added column in `core.k8sgpt.ai.result` table to link to target resource
- Added new tab in pod resource detail page containing simple text of issue

### Generic takeaways
- There's pretty bad feedback on failure state from k8sgpt / operator.
  - silently failing to talk to ollama just mean no detail. no error messages, failing conditions, etc anywhere
  - CI - Dashboard - For workloads with multiple contains make it clearer that the log view covers both and user can switch between them 
  - CI - Dashboard - The log view can really struggle with streams that print out 2/3 every second. Should the default no be 30 minute but 10k lines?
- CI - Dashboard - Improve the ui extension getting started guide
  - https://extensions.rancher.io/extensions/next/extensions-getting-started
  - not an a --> b guide. introduced to a command at top, then random sidetrack on how to get a kube cluster up and running (doesn't need to be in guide), then arg info for command from above and different ways it can be used
- CI - Dashboard - App Creator creates incorrect pkg annotations (> 3.0.0 but rancher > 2.9.3)
- CI - Dashboard - Populate ts definitions for existing, documented types
  - TableColumn
- CI - Dashboard - Add info to extension point tabs to inform user the resource is a prop in the component. https://extensions.rancher.io/extensions/next/api/tabs