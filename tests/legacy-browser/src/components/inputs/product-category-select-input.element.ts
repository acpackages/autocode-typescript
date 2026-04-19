/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcMessage, acRegisterCustomElement, AcSelectInputElement } from "@autocode-ts/ac-browser";
import { AcEnumHttpResponseCode, IAcOnDemandRequestArgs, IAcOnDemandResponseArgs } from "@autocode-ts/autocode";

export class ProductCategorySelectInput extends AcSelectInputElement {
  // onDemandRowsFunction:Function = async (request:IAcOnDemandRequestArgs)=>{
  //   let pageNumber:number = 0;
  //   const rowsCount:number = request.rowsCount ?? 5000;
  //   if(request.startIndex!=undefined){
  //     pageNumber = (request.startIndex / rowsCount)+1;
  //   }
  //   const response = await AcH.postApi({url:API_URLS.productCategories.get,data:{
  //     rowsCount,
  //     pageNumber,
  //     [TblActAccountees.AccounteeId]:App.activeAccounteeId
  //   }});
  //   if(response.status == AcEnumHttpResponseCode.Ok){
  //     const apiResponse = response.data!;
  //     if(apiResponse.status == 'success' ){
  //       request.successCallback({totalCount:apiResponse.data.totalRows,data:apiResponse.data.rows});
  //     }
  //     else{
  //       AcMessage.error({message:apiResponse.message});
  //     }
  //   }
  //   else{
  //     AcMessage.error({message:App.getHTTPResponseMessage({response})});
  //   }
  // }
  constructor() {
    super();
    this.labelKey = 'product_category_name';
    this.valueKey = 'product_category_id';
    this.placeholder = 'Select Product Category';
    // this.onDemandRowsFunction({successCallback:(response:IAcOnDemandResponseArgs)=>{
    //   this.dataManager.data = response.data;
    // }});
  }
}

acRegisterCustomElement({ tag: 'product-category-select-input', type: ProductCategorySelectInput });
