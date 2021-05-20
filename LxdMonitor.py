#!/usr/bin/env python

from flask import Flask, jsonify, request, Response
from pylxd import Client
import urllib3

urllib3.disable_warnings()


class JsonResponse(Response):
    @classmethod
    def force_type(cls, response, environ=None):
        if isinstance(response, (list, dict)):
            response = jsonify(response)
        return super(Response, cls).force_type(response, environ)


app = Flask(__name__)
app.response_class = JsonResponse


@app.route("/", methods=['GET', 'POST'])
def hello():
    content = request.get_json()
    print(content)

    client = Client(endpoint='https://{}:8443'.format(content['ip']),
                    cert=('client.crt', 'client.key'), verify=False)

    id = 0
    response = []
    if content['command'] == "containers":
        containers = client.containers.all()
        for c in containers:
            data = {
                "id": id,
                "name": c.name,
                "status": c.status,
                "devices": "",
            }

            for k in c.devices:
                data['devices'] += "{}: {}({})<br>".format(k, c.devices[k]['parent'], c.devices[k]['nictype'])
            response.append(data)
            id += 1
    elif content['command'] == "images":
        images = client.images.all()
        for c in images:
            data = {
                "id": id,
                "alias": "",
                "fingerprint": c.fingerprint[:10],
                "architecture": c.architecture,
                "uploaded_at": c.uploaded_at,
                "public": c.public,
                "size": c.size,
            }
            for alias in c.aliases:
                data['alias'] += alias['name']
                if alias['description'] != "":
                    data['alias'] += ": " + alias['description'] + '<br>'
            response.append(data)
            id += 1
    elif content['command'] == "networks":
        networks = client.networks.all()
        for c in networks:
            if not c.managed:
                continue
            data = {
                "id": id,
                "name": c.name,
                "type": c.type,
                "used_by": "",
                "config": "",
            }
            if c.used_by is not None:
                for use in c.used_by:
                    data['used_by'] += '{}<br>'.format(use[use.rfind('/') + 1:])
            data['config'] += '{}(NAT: 1)<br>{}(NAT: 1)<br>'.format(c.config['ipv4.address'],
                                                                    c.config['ipv6.address'])
            response.append(data)
            id += 1
    elif content['command'] == "profiles":
        profiles = client.profiles.all()
        for c in profiles:
            response.append({"id": id, "name": c.name})
            id += 1

    return {"result": response}
