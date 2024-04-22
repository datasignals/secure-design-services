import { Component, FormEvent} from "react";
// import contract from "../config.json"
import BackendRoutes from "../BackendRoutes";
import config from "../config.json";
// import { Value } from "sass";
interface Props {

}

interface State {
    formData:{
        designerName: string;
        startDate: string;
        endDate: string;
    };

    tableData: Array<any>;
    isloading: boolean;
    searchQuery: string;
    filteredTableData: Array<any>;
    filterFlag: boolean;
}


export default class CreateReportMSAScreen extends Component<Props, State> {


    constructor(props: Props) {
        super(props);
        document.title = `CMS - Create Report`;
        this.state = {
            formData:{
                designerName: '',
                startDate: '',
                endDate: '',
            },
            tableData: [],
            isloading: false,
            searchQuery: '',
            filteredTableData: [],
            filterFlag: false,
        };
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    }
    async handleSubmit(event: FormEvent) {
        
        event.preventDefault();
        // const { formData } = this.state;
        console.log("Inside Handle submit",this.state.formData.designerName);
        console.log(this.state.formData.startDate)
        if(this.state.formData.designerName && !this.state.formData.startDate && !this.state.formData.endDate){

            const data = await BackendRoutes.ROUTE_GET_RECORDS_DESIGNER(this.state.formData.designerName);
            console.log("DATA",data)
            console.log("TABLE1",data.data.length)
            this.setState({
                formData: {
                    designerName: "",
                    startDate: "",
                    endDate: "",
                },
                tableData: data.data || [],
                // filteredTableData: data.data || []  
            });
            if(data.data.length === 0)
            {
                console.log("INSIDE LENGTH IF1")  
                this.setState((prevState) => ({
                    // console.log(prevState)
                    // return {...prevState, isloading:true}
                    
                        ...prevState,
                        isloading: true,
                    
                }))
            }
        }
        else if(this.state.formData.designerName && this.state.formData.startDate && this.state.formData.endDate) {
            console.log("Inside second if");
            const startDateFormatted = (await this.formatDate(this.state.formData.startDate)).toString();
            const endDateFormated = (await this.formatDate(this.state.formData.endDate)).toString();
            console.log("Formated Start Date",startDateFormatted);
            const data = await BackendRoutes.ROUTE_GET_RECORDS_TIME(this.state.formData.designerName, startDateFormatted, endDateFormated);
            console.log("DATA",data)
            this.setState({
                formData: {
                    designerName: "",
                    startDate: "",
                    endDate: "",
                },
                tableData: data.data || [],
                // filteredTableData: data.data || [],
            });
            if(data.data.length === 0)
            {
                console.log("INSIDE LENGTH IF")  
                this.setState((prevState) => ({
                    // console.log(prevState)
                    // return {...prevState, isloading:true}
                        ...prevState,
                        isloading: true,
                    
                }))
            }
        }
        else{
            window.alert("Give Proper Inputs")
            this.setState({
                formData: {
                    designerName: "",
                    startDate: "",
                    endDate: "",
                },
                tableData: [],
                // filteredTableData: []  ,
            });
        }
    }

    async handleInputChange(event: any) {
        const { name, value } = event.target;
        this.setState((prevState) => ({
          formData: {
            ...prevState.formData,
            [name]: value,
          },
          searchQuery:'',
          filterFlag: false
        }));
      }

    async formatDate(inputDate: string) {
        const date = new Date(inputDate);
        date.setHours(0, 0, 0, 0);
        const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
        const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
        const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        return `${month} ${day} ${hours}:${minutes}:${seconds} ${year}`;
    };
    

    async handleSearch(event: FormEvent) {
        event.preventDefault();
        const { tableData, searchQuery } = this.state;
        // console.log("Search", searchQuery);
        console.log("Search", tableData);

        // const filteredTableData = tableData.flatMap(obj => 
        //     obj.Filerecords.filter((record:any)=> 
        //     record.filePath.toLowerCase().includes(searchQuery.toLowerCase())));
            

        // this.setState({ filteredTableData, filterFlag: true });
        // console.log("FILTEREDATA",filteredTableData)


        const filteredTableData = tableData.flatMap(obj => 
            obj.Filerecords.filter((record:any)=> 
                record.filePath.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((record: any) => ({
                        ...record,
                        checksumMatch: obj.checksumMatch // Retain checksumMatch from parent object
                    })
            )
        );
    
        this.setState({ filteredTableData, filterFlag: true });
   
    }
    async handleSearchInputChange(event:any){
        this.setState({ searchQuery: event.target.value });
    }
    
    
    render() {
        const {formData,tableData,searchQuery,filteredTableData} = this.state;
        console.log("LENGTH",this.state.filteredTableData.length)
        return(
            <section id="content-wrapper" className="dashboard-section">
                <div className="row">
                    <form onSubmit={this.handleSubmit}>
                        <div><label>
                            Designer Name: 
                            <span>
                            <input type="text" name="designerName" value={formData.designerName} style={{ marginLeft: '10px' }}  onChange={this.handleInputChange} /></span>
                        </label></div>
                        <div><label>
                            Start Date:
                            <input type="date" name="startDate" value={formData.startDate} style={{ marginLeft: '10px' }} onChange={this.handleInputChange} />
                        </label></div>
                        <div><label>
                            End Date:
                            <input type="date" name="endDate" value={formData.endDate} style={{ marginLeft: '10px' }} onChange={this.handleInputChange} />
                        </label></div>
                        <div><button type="submit" className="btn btn-success">Go</button></div>    
                    </form>
                    
                    {this.state.tableData.length !== 0 && (<form style={{ marginLeft: '30px' }} onSubmit={this.handleSearch}>
                        <input type="text" value={searchQuery}  onChange={this.handleSearchInputChange} placeholder="Search On Table" />
                        <button type="submit" className="btn btn-success" style={{ marginLeft: '10px' }} >Search</button>
                    </form>
    )}
                </div>



<div className="row">
    {tableData.length > 0 && this.state.filterFlag===false && (
        <div className="col-lg-12">
            <div className="card">
                <div className="card-body py-0 pl-0">
                    <div className="table-responsive">
                        <table className="table table-striped scroll mb-0 approval-table">
                            <thead>
                                <tr className="table-row">
                                    <th>Time Stamp</th>
                                    <th>Event</th>
                                    <th>File Path</th>
                                    <th>Check Sum</th>
                                </tr>
                            </thead>
                            <tbody style={{ height: "auto" }}>
                                {tableData.map((record, index) => (
                                    record.Filerecords.map((fileRecord: {
                                        timestamp: string;
                                        event: string;
                                        filePath: string;
                                    }, fileIndex: any) => {
                                        const date = new Date(fileRecord.timestamp);
                                        const formattedDate = date.toString().replace(/GMT[+-]\d{4} \(([A-Za-z\s]+)\)$/, '');
                                        const timeZoneMatch = date.toString().match(/GMT[+-]\d{4} \(([A-Za-z\s]+)\)$/);
                                        let timeZone = timeZoneMatch ? timeZoneMatch[1] : '';
                                        return (
                                            <tr key={`${index}-${fileIndex}`}>
                                                <td>{formattedDate}</td>
                                                <td>{fileRecord.event}</td>
                                                <td>

                                                    <a href={config.explorerLink + `${record.blockchainHash}`} target="_blank" rel="noopener noreferrer">
                                                    {fileRecord.filePath}
                                                </a>
                                                </td>
                                                <td>{record.checksumMatch ? "Valid" : "Tampered"}</td>
                                            </tr>
                                        );
                                    })
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )}

    {tableData.length === 0 && this.state.isloading && (
        <div className="col-lg-12">
            <h3>No Records As Per Inputs</h3>
        </div>
    )}
</div>

{filteredTableData?.length > 0 && this.state.filterFlag &&(
    <div className="col-lg-12">
        <div className="card">
            <div className="card-body py-0 pl-0">
                <div className="table-responsive">
                    <table className="table table-striped scroll mb-0 approval-table">
                        <thead>
                            <tr className="table-row">
                                <th>Time Stamp</th>
                                <th>Event</th>
                                <th>File Path</th>
                                <th>Check Sum</th>
                            </tr>
                        </thead>
                        <tbody style={{ height: "auto" }}>
    {filteredTableData && filteredTableData.length > 0 ? (
        filteredTableData.map((fileRecord, index) => (
            <tr key={index}>
                <td>{new Date(fileRecord.timestamp).toString().replace(/GMT[+-]\d{4} \(([A-Za-z\s]+)\)$/, '')}</td>
                <td>{fileRecord.event}</td>
                <td>
                    <a href={config.explorerLink + `${fileRecord.blockchainHash}`} target="_blank" rel="noopener noreferrer">
                        {fileRecord.filePath}
                    </a>
                </td>
                <td>{fileRecord.checksumMatch ? "Valid" : "Tampered"}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td>No records found</td>
        </tr>
    )}
</tbody>




                        {/* <tbody style={{ height: "auto" }}>
                            {filteredTableData && filteredTableData.length>0 && filteredTableData.map((record, index) => (
                                record.Filerecords.map((fileRecord: {
                                    timestamp: string;
                                    event: string;
                                    filePath: string;
                                }, fileIndex: any) => {
                                    const date = new Date(fileRecord.timestamp);
                                    const formattedDate = date.toString().replace(/GMT[+-]\d{4} \(([A-Za-z\s]+)\)$/, '');
                                    const timeZoneMatch = date.toString().match(/GMT[+-]\d{4} \(([A-Za-z\s]+)\)$/);
                                    let timeZone = timeZoneMatch ? timeZoneMatch[1] : '';
                                    return (
                                        <tr key={`${index}-${fileIndex}`}>
                                            <td>{formattedDate}</td>
                                            <td>{fileRecord.event}</td>
                                            <td>
                                            <a href={config.explorerLink + `${record.blockchainHash}`} target="_blank" rel="noopener noreferrer">
                                                    {fileRecord.filePath}
                                            </a>
                                            </td>
                                            <td>{record.checksumMatch ? "Valid" : "Tampered"}</td>
                                        </tr>
                                    );
                                })
                            ))}
                        </tbody> */}
                    </table>
                </div>
            </div>
        </div>
    </div>
)}
{filteredTableData.length === 0 && this.state.filterFlag && (
        <div className="col-lg-12">
            <h3>No Records As Per Search Inputs</h3>
        </div>
    )}

                
            </section>
        );
    }









    


}
