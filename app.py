from flask import Flask, jsonify, render_template, request, redirect, json
import sqlalchemy
import psycopg2
from sqlalchemy import create_engine
import json
#from flask_sqlalchemy import SQLAlchemy
import os
#################################################
# Flask Setup
#################################################
app = Flask(__name__)

from urllib.parse import urlparse

print(os.environ.get("DATABASE_URL"))


os.environ["DATABASE_URL"] = "postgres://fbcshsxigvoylt:10631d0d80106f558fa5dd4ba0c8aa0a0bdc227020cd09f7bfae6e75ec3fd4e8@ec2-3-215-207-12.compute-1.amazonaws.com:5432/de5fjc5oru29o5"

if "DATABASE_URL" in os.environ :
    url = urlparse(os.environ.get('DATABASE_URL'))
    db = "dbname=%s user=%s password=%s host=%s " % (url.path[1:], url.username, url.password, url.hostname)
    schema = "schema.sql"
    conn = psycopg2.connect(db)
    #cur = conn.cursor()
else: 
    conn = psycopg2.connect(host="localhost", port = 5432, database="Minneapolis_Police_Force_db")

print(conn)

#app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL") or 'postgres://swain:db@localhost/Minneapolis_Police_Force_db'
#print(app.config['SQLALCHEMY_DATABASE_URI'])

#engine = create_engine(f'postgresql://swain:db@localhost:5432/Minneapolis_Police_Force_db')
#connection = engine.connect()
# Create a cursor object


cur = conn.cursor()
# engine = psycopg2.connect("postgresql://postgres:postgres@localhost:52632/mydatabase", echo=False)
#################################################
# Flask Routes
#################################################
#pd.read_sql

#Fetch all neighborhood names 
cur.execute("SELECT name FROM neighborhood where neighborhood_id in (select distinct neighborhood_id from vw_police_use_of_force) and neighborhood_id in (select distinct neighborhood_id from race_by_neighborhood) and neighborhood_id in (select distinct neighborhood_id from household_income_by_neighborhood) ORDER BY name;")

#Convert list of neighborhood names to a dixtionary
columns = [col[0] for col in cur.description]
neighborhood = [dict(zip(columns, row)) for row in cur.fetchall()]

@app.route("/", methods=['GET', 'POST'])
def echo():
    
    #reroute to new neighborhood url based on form input from user
    if request.method == 'POST':
        newNeighborhood = request.form['neighborhood']
        return redirect("/" + newNeighborhood)

    return render_template("index.html", neighborhood=neighborhood)

@app.route("/api/geojson")
def welcome():
    cur.execute("select * from vw_police_use_of_force") 
    columns = [col[0] for col in cur.description]
    use_of_force = [dict(zip(columns, row)) for row in cur.fetchall()]
    return jsonify(use_of_force) 

    

@app.route("/api/nbh_bubble")
def nbh_bubble():
    cur.execute("select * from vw_force_nbh_stats where neighborhood_name <>'Downtown West';") 
    columns = [col[0] for col in cur.description]
    nbh_stats = [dict(zip(columns, row)) for row in cur.fetchall()]
    return jsonify(nbh_stats) 

@app.route("/geojson")
def mpls_geojson():
    
    return render_template("map.html")

@app.route("/mpls_deepdive", methods=['GET', 'POST'])
def mpls_deepdive():

    #reroute to new neighborhood url based on form input from user
    if request.method == 'POST':
        newNeighborhood = request.form['neighborhood']
        return redirect("/" + newNeighborhood)
    
    #Column names for 2nd table in index page
    columns_data1 = ['Neighborhood', 'Use of Force Cases', '% White - Use of Force', '% Of Color - Use of Force','% Race Unknown - Use of Force', '% White (Demographics)'
                ,'% Of Color (Demographics)', 'Median Household Income','Income Group']

    #Query 1st table in index page
    cur.execute("SELECT neighborhood, total_cases, pct_white, pct_of_color, 100-(pct_white+pct_of_color) AS pct_race_unknown , demo_white_pct,\
                demo_of_color_pct, median_income, income_group FROM top_10_neighborhood ORDER BY cast(replace(total_cases,',','') as int) DESC LIMIT 5;")
    use_force= cur.fetchall()

    #Column names for 2nd table in index page
    columns_data2 = ['Categories', 'Correlation', 'Result']

    #Query 1st table in index page
    cur.execute("SELECT descr,round(correlation,4) as correlation, result  FROM corelation;")
    corelation= cur.fetchall()
    

    return render_template("mpls_deepdive.html", neighborhood=neighborhood, use_force=use_force,columns_data1=columns_data1, corelation=corelation, columns_data2=columns_data2)

@app.route("/inference")
def inference():

    #Column names for 2nd table in index page
    columns_data2 = ['Subject Race', 'p-value (vs White pop)', 'Avg Police Force Incidents by Neighborhood']

    #Query 2nd table in index page
    cur.execute("select description, substring(p_value,1,7) as p_value ,substring(police_force_incidents,1,6) as police_force_incidents from ttest;")
    ttest= cur.fetchall()
    
    return render_template("Inference.html",ttest=ttest, columns_data2=columns_data2 )

@app.route("/cluster")
def cluster():

    #Column names for  table
    columns_data3 = ['Race & Resistance Type', 'Cluster Severity - High', 'Cluster Severity - Medium', 'Cluster Severity - Low']

    #Query 
    cur.execute("select * from cluster_ndb_1 order by cluster1_high DESC, cluster2_med DESC, cluster3_low DESC;")
    cluster_nbd= cur.fetchall()
    
    return render_template("crime-cluster.html",cluster_nbd=cluster_nbd, columns_data3=columns_data3 )

# Add a new route to display stats for dynamically seleted neighborhood
@app.route("/<neighborhood>")
def neighborhood_data(neighborhood):
    
    #Query table in neighborhood page
    cur.execute("select * from police_use_of_force WHERE neighborhood =  %s;", ((neighborhood),))
    columns = [col[0] for col in cur.description]
    nhbd_dict = [dict(zip(columns, row)) for row in cur.fetchall()]
    neighborhood_use_of_force = json.dumps(nhbd_dict,default=str)
    
    #income data
    cur.execute("select * from vw_neighborhood_income WHERE name =  %s;", ((neighborhood),))
    columns_n = [col[0] for col in cur.description]
    income_dict = [dict(zip(columns_n, row)) for row in cur.fetchall()]
    income = json.dumps(income_dict,default=str)

    #demographics
    cur.execute("select * from vw_neighborhood_demographics WHERE name =  %s;", ((neighborhood),))
    columns_m = [col[0] for col in cur.description]
    demographics_dict = [dict(zip(columns_m, row)) for row in cur.fetchall()]
    demographics = json.dumps(demographics_dict,default=str)

    #Column names for table in neighborhood page
    columns_data = ['Year', 'Police Incidents Count', 'Use of Force Cases', '% White Use of Force', '% Of Color Use of Force', '% White (Demographics)'
                ,'% Of Color (Demographics)', 'Median Household Income ($)','Income Group']

    #Query table in neighborhood page
    cur.execute("SELECT incident_year,cases_count,police_use_of_force_cnt,pct_white_use_of_force,pct_of_color_use_of_force,white_pct,of_color_pct,median_income,\
                income_group FROM mls_neighborhood_stats WHERE neighborhood_name =  %s order by incident_year;", ((neighborhood),))
    nhbd = cur.fetchall()
   
 
    return render_template("neighborhood.html",  neighborhood_use_of_force=neighborhood_use_of_force,  nbr=neighborhood, income=income, demographics=demographics,columns_data=columns_data, nhbd=nhbd ) 


if __name__ == "__main__":
    app.run(debug=True)