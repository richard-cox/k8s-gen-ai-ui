# k8s-gen-ai-ui

The Rancher UI endeavours to report cluster issues to users and show enough detail for them understand what has happened. That's normally where the user departs Rancher to find a solution, to then hopefully return to apply it. 

K8sGTP is a tool that will help fill the missing link between problem and application of resolution by diagnosing the issue and suggesting steps to address it.

This project involves integrating the output of K8sGTP and applying it in the correct context to assist the user. It will do this by using the Rancher UI Extension mechanism to create an independent extension outside of the Rancher UI code base.

> This is not designed to be an exemplary production ready extension, but a bit of fun with k8sgpt, gen AI and the Rancher UI

See [hackweek doc](./hackweek.md) for details.