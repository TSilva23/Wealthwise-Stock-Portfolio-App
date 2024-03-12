from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

ALPHA_VANTAGE_API_KEY = os.getenv('ZBD3QIPITMQNSPPF')

@app.route('/api/all-stocks')
def all_stocks():
    url = f'https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url, stream=True)
    
    def generate():
        for chunk in response.iter_lines():
            yield chunk + b'\n'
    
    return Response(generate(), content_type='text/csv')

@app.route('/api/stock/<symbol>')
def stock_data(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    return jsonify(response.json())

@app.route('/api/quote/<symbol>')
def stock_quote(symbol):
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
