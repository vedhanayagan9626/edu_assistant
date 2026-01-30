import socket
import requests
import sys

def check_dns(hostname):
    print(f"Checking DNS for {hostname}...")
    try:
        ip = socket.gethostbyname(hostname)
        print(f"DNS Resolved {hostname} to {ip}")
        return True
    except socket.gaierror as e:
        print(f"DNS Resolution Failed: {e}")
        return False

def check_https(url):
    print(f"Checking HTTPS connection to {url}...")
    try:
        response = requests.head(url, timeout=5)
        print(f"Status Code: {response.status_code}")
        return True
    except Exception as e:
        print(f"HTTPS Connection Failed: {e}")
        return False

if __name__ == "__main__":
    hostname = "huggingface.co"
    url = f"https://{hostname}"
    
    dns_success = check_dns(hostname)
    https_success = check_https(url)
    
    if dns_success and https_success:
        print("\nSUCCESS: Network connectivity looks good from Python.")
    else:
        print("\nFAILURE: Network issues detected.")
