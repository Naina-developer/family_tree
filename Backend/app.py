from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
from flask_cors import CORS
import pdfkit

app = Flask(__name__)
CORS(app)

# MySQL Configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '12345'
app.config['MYSQL_DB'] = 'family_tree'

mysql = MySQL(app)

# Add a Family Member
@app.route('/add_member', methods=['POST'])
def add_member():
    data = request.json
    name = data['name']
    relation = data['relation']
    parent_id = data.get('parent_id', None)

    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO members (name, relation, parent_id) VALUES (%s, %s, %s)", (name, relation, parent_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'Member added successfully'})

# Get All Family Members
@app.route('/get_members', methods=['GET'])
def get_members():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM members")
    members = cursor.fetchall()
    cursor.close()

    result = [{'id': row[0], 'name': row[1], 'relation': row[2], 'parent_id': row[3]} for row in members]
    return jsonify(result)

# Delete a Family Member
@app.route('/delete_member/<int:id>', methods=['DELETE'])
def delete_member(id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM members WHERE id = %s", (id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'Member deleted successfully'})

# Export Family Tree as PDF
@app.route('/export_pdf', methods=['GET'])
def export_pdf():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM members")
    members = cursor.fetchall()
    cursor.close()

    html_content = render_template("family_tree.html", members=members)
    pdfkit.from_string(html_content, "family_tree.pdf")
    
    return jsonify({'message': 'PDF exported successfully'})

if __name__ == '__main__':
    app.run(debug=True)
