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

### K8sGPT Results
- View k8sgpt operator controller-manager `pod` log `manager` container for worthwhile logs
- View k8sgpt ollama `pod` log for details about the args used in k8sgtp analyse request
- View ollama `pod` log for http request (and path) logs
- If there are dodgy pods then there should be `core.k8sgpt.ai.result` / `Results` CR's created
  - Examples i was using
    - pod with container image all in caps
    - pod with container image that does not exist
    - pod that's broken https://raw.githubusercontent.com/robusta-dev/kubernetes-demos/main/crashpod/broken.yaml
    - service with a selector not applicable to any pods (after adding service type to k8sgpt config object)

### Troubleshooting

- There's no `detail` in a `core.k8sgpt.ai.result`
  - k8sgpt operator is probably silently failing to connect to ollama
  - nuke the `k8sgpt-operator-system/k8sgpt-operator-controller-manager-<sdf>` POD and check the start of it's container named `manager` 
  - the state of the connection between the operator and ollama should be announced there 

### UI Extension

- Create initial ui extension
  - Added better labelling for k8sgpt resource types
  - Added column in `core.k8sgpt.ai.result` table to link to target resource
  - Added new tab in pod resource detail page containing simple text of issue

## Day 2
- Beefed Up ui extension
  - Better tab formatting, display and content
  - Better l10n
  - Create a list override component for k8sgpt results table (better columns)
  - Bring back k8sgpt result resource model
  - Add tab and columns to service type
  - Switch from BadgeStateFormatter to custom extension formatter for resource genai column badge
- Resolved some extension issues around shell imports and build
  - In a ts, or vue component with script ts, cannot import ts based files that haven't had type generated and shipped in shell (type-gen)
  - shell/mixins/resource-fetch, @shell/plugins/steve/steve-class
- Experimented with different resource types
  - service
    - picked up selector with no hits
  - catalog.cattle.io.clusterrepo
    - CRDs don't have analyzers - https://github.com/k8sgpt-ai/k8sgpt?tab=readme-ov-file#built-in-analyzers
  - event
    - didn't create any results (would this contribute info to other resources?)
  - node
    - didn't create any results (would this contribute info to other resources?)

## Day 3



## TODO:
- ~Resources other than pod?~
- ~Resolve shell reference in model file~ ts --> js, or type-gen update
- publish charts
- screenshots
- Vue3 version of extension
- add other analysers? switch ai?
- update config
  - rename localai --> ollama
  - anonymize false
- custom analyzer? https://github.com/k8sgpt-ai/k8sgpt?tab=readme-ov-file#proceed-with-care  `Custom Analyzers`
  - can this be configured with k8sgpt-operator?
- notifications?  


## Takeaways
- K8SGTP / OLLAMA
  - There's pretty bad feedback on failure state from k8sgpt / operator.
    - silently failing to talk to ollama just meant no detail. no error messages, failing conditions, etc anywhere
    - create rancher/dashboard issue
      - For workloads with multiple contains make it clearer that the log view covers both and user can switch between them 
      - The log view can really struggle with streams that print out 2/3 every second. Should the default no be 30 minute but 10k lines?
  - Limited set of resource analysers, no smarts for CRs
- Dashboard (to create issues)  
  - Improve the ui extension getting started guide
    - https://extensions.rancher.io/extensions/next/extensions-getting-started
    - not an a --> b guide. introduced to a command at top, then random sidetrack on how to get a kube cluster up and running (doesn't need to be in guide), then arg info for command from above and different ways it can be used
  - App Creator creates incorrect pkg annotations (> 3.0.0 but rancher > 2.9.3)
  - Populate ts definitions for existing, documented types
    - TableColumn
  - Add info to extension point tabs to inform user the resource is a prop in the component. https://extensions.rancher.io/extensions/next/api/tabs
  - Review 'starred' grouping. on return, nav around, etc annoying to have to continually re-open starred group
  - Ability to specify order of column added to table
  - Create types for additional js files (entries in type-gen, otherwise ts based files will fail to build)
    - '@shell/mixins/resource-fetch'
    - '@shell/plugins/steve/steve-class'
  - Resource search should search on native name as well as label (authconfig vs Auth Provider)
  - Resource search should search on partial string `crd` would match CustomResourceDefinition
  - `/dist-pkg` should be added to extension app's package.json 
  - Creating an extension for 2.9 is hard
    - creator creates 3.x version
    - lots of manual copy and paste
    - build-extension-charts point to master, however changing to release-2.9 required additional tagged_release input `tagged_release: ${{ github.ref_name }}` to `jobs ... with`
  - No search in dev kit site
  - Not clear gh-pages needs to be created (step by step) https://extensions.rancher.io/extensions/next/publishing#proper-tagged-release-naming-scheme-to-build-extension-catalog-image
  - Not clear how to add to rancher after chart created
- When creating the extension here's some of the reasons i had to switch to look at 
dashboard code
  - what's passed through to tab component props
  - formatters library
  - how to get to store from column getValue
  - had to look at code of BadgeStateFormatter to work out solution (arbitrary), STATES_ENUM
